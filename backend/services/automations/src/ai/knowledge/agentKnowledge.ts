import type { IModels } from '../../connectionResolver';
import type { IAiAgentKnowledgeSourceBindingDocument } from '../../mongo/aiAgentKnowledgeSourceBinding';
import type { IKnowledgeChunkDocument } from '../../mongo/knowledgeChunk';
import type { TAiAgentInput } from '../aiAgent';
import { fitChunksWithinBytes, retrieveAiKnowledgeChunks } from './retrieve';
import { loadAiKnowledgeRouteHints } from './routes';
import {
  mapSharedKnowledgeDocumentToChunk,
  searchAiAgentKnowledge,
} from './runtime';
import {
  AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
  getKnowledgeSourceIdentity,
  getKnowledgeSourceType,
} from './sourceConfig';
import { TAiKnowledgeChunk } from './types';

// Up to this size the whole knowledge goes into the prompt: nothing has to be
// found, so a question in any language reaches every passage.
export const AI_KNOWLEDGE_FULL_CONTEXT_MAX_BYTES = 32_000;

export const AI_KNOWLEDGE_SECTION_SEPARATOR = ' › ';

const MAX_INDEX_SECTIONS = 120;
const MAX_INDEXED_CHUNKS = 5_000;
const MAX_ALWAYS_CHUNKS = 20;
const MAX_SECTION_LABEL_CHARS = 80;
const SECTION_HEAD_CHARS = 120;
const SECTION_RESULT_TOP_K = 8;
const SECTION_RESULT_MAX_BYTES = 12_000;

const INTERNAL_FILE_NAME =
  /\.(md|markdown|txt|pdf|docx?|csv|json|ya?ml|html?)$/i;

// An uploaded document's file name says nothing a customer needs and everything
// an attacker wants, so only a real human-written title survives.
export const toPublicKnowledgeTitle = (title?: string) => {
  const trimmed = (title || '').trim();

  return trimmed && !INTERNAL_FILE_NAME.test(trimmed) ? trimmed : undefined;
};

export type TAiAgentKnowledge =
  | { kind: 'none' }
  | { kind: 'full'; chunks: TAiKnowledgeChunk[] }
  | {
      kind: 'indexed';
      sections: string[];
      indexText: string;
      chunkIdsBySection: Map<string, string[]>;
      alwaysChunks: TAiKnowledgeChunk[];
    };

type TKnowledgeFilter = Record<string, unknown>;

type TSectionRow = {
  _id: string;
  headingPath?: string[];
  title?: string;
  head?: string;
};

type TBindingRow = Pick<
  IAiAgentKnowledgeSourceBindingDocument,
  'pluginName' | 'moduleName' | 'sourceKey' | 'sourceId'
>;

const pushTo = <T>(map: Map<string, T[]>, key: string, value: T) => {
  const values = map.get(key);

  if (values) {
    values.push(value);
  } else {
    map.set(key, [value]);
  }
};

// Every chunk this agent may read: its own files plus the bound documents of
// the sources it is configured with.
const buildAgentKnowledgeFilter = async ({
  models,
  agentId,
  agent,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
}): Promise<TKnowledgeFilter> => {
  // Core and policy files are already read whole into every prompt.
  const wholeFileIds = agent.context.files
    .filter(({ purpose }) => purpose === 'core' || purpose === 'policy')
    .map(({ id }) => id);
  const filters: TKnowledgeFilter[] = [
    {
      agentId,
      sourceType: AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
      ...(wholeFileIds.length ? { fileId: { $nin: wholeFileIds } } : {}),
    },
  ];
  const configuredTypes = new Set(
    (agent.context.knowledgeSources || []).map((source) =>
      getKnowledgeSourceType(getKnowledgeSourceIdentity(source)),
    ),
  );

  if (configuredTypes.size) {
    const bindings = await models.AiAgentKnowledgeSourceBindings.find(
      { agentId, status: 'indexed' },
      { pluginName: 1, moduleName: 1, sourceKey: 1, sourceId: 1 },
    ).lean<TBindingRow[]>();
    const sourceIdsByType = new Map<string, string[]>();

    for (const binding of bindings) {
      const sourceType = getKnowledgeSourceType(binding);

      if (configuredTypes.has(sourceType)) {
        pushTo(sourceIdsByType, sourceType, binding.sourceId);
      }
    }

    for (const [sourceType, sourceIds] of sourceIdsByType) {
      // Staff-only documents never reach a reply that may be customer-facing.
      filters.push({
        sourceType,
        sourceId: { $in: sourceIds },
        visibility: { $ne: 'internal' },
      });
    }
  }

  return { $or: filters };
};

const firstContentLine = (content: string) =>
  content
    .split('\n')
    .map((line) => line.replace(/^[\s#>*|_-]+/, '').trim())
    .find(Boolean) || '';

// A banner rule like "=====" is a heading to the chunker but names nothing.
const HAS_LETTER = /\p{L}/u;

// Headings name a section in whatever language the knowledge is written in;
// a chunk without any falls back to its title (a source document titled
// "Category › Article" groups under its category), then to its opening line.
const toSectionPath = ({ headingPath, title, head }: TSectionRow) => {
  const headings = (headingPath || [])
    .map((heading) => heading.trim())
    .filter((heading) => HAS_LETTER.test(heading));
  const path = headings.length
    ? headings
    : (
        toPublicKnowledgeTitle(title) || firstContentLine(head || '')
      ).split(AI_KNOWLEDGE_SECTION_SEPARATOR);

  return path
    .map((part) => part.trim())
    .filter((part) => HAS_LETTER.test(part))
    .slice(0, 2)
    .map((part) => part.slice(0, MAX_SECTION_LABEL_CHARS));
};

const buildKnowledgeIndex = (rows: TSectionRow[]) => {
  const tree = new Map<string, Map<string, string[]>>();

  for (const row of rows) {
    const [top, child = ''] = toSectionPath(row);

    if (!top) {
      continue;
    }

    const children = tree.get(top) || new Map<string, string[]>();
    pushTo(children, child, row._id);
    tree.set(top, children);
  }

  const leafCount = [...tree.values()].reduce(
    (sum, children) => sum + children.size,
    0,
  );
  // A large knowledge lists only its top level, so the index stays readable.
  const listChildren = leafCount <= MAX_INDEX_SECTIONS;
  const chunkIdsBySection = new Map<string, string[]>();
  const lines: Array<{ top: string; text: string }> = [];

  for (const [top, children] of tree) {
    if (chunkIdsBySection.size >= MAX_INDEX_SECTIONS) {
      break;
    }

    chunkIdsBySection.set(top, [...children.values()].flat());
    const named = [...children.keys()].filter(Boolean);

    if (listChildren && named.length) {
      for (const child of named) {
        chunkIdsBySection.set(
          `${top}${AI_KNOWLEDGE_SECTION_SEPARATOR}${child}`,
          children.get(child) || [],
        );
      }

      lines.push({
        top,
        text: `- ${top}${AI_KNOWLEDGE_SECTION_SEPARATOR}${named.join(', ')}`,
      });
    } else {
      lines.push({ top, text: `- ${top}` });
    }
  }

  return {
    sections: [...chunkIdsBySection.keys()],
    lines,
    chunkIdsBySection,
  };
};

// Decided per run from what is actually indexed, not from agent settings:
// small knowledge is read whole, large knowledge is searched by section.
export const resolveAiAgentKnowledge = async ({
  models,
  agentId,
  agent,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
}): Promise<TAiAgentKnowledge> => {
  if (!agent.context.retrieval?.enabled) {
    return { kind: 'none' };
  }

  const filter = await buildAgentKnowledgeFilter({ models, agentId, agent });
  const [measure] = await models.KnowledgeChunks.aggregate<{
    totalBytes: number;
  }>([
    { $match: filter },
    { $group: { _id: null, totalBytes: { $sum: '$byteSize' } } },
  ]);
  const totalBytes = measure?.totalBytes || 0;

  if (!totalBytes) {
    return { kind: 'none' };
  }

  if (totalBytes <= AI_KNOWLEDGE_FULL_CONTEXT_MAX_BYTES) {
    const docs = await models.KnowledgeChunks.find(filter, { embedding: 0 })
      .sort({ sourceType: 1, sourceId: 1, chunkIndex: 1 })
      .lean<IKnowledgeChunkDocument[]>();

    return { kind: 'full', chunks: docs.map(mapSharedKnowledgeDocumentToChunk) };
  }

  const [rows, alwaysDocs] = await Promise.all([
    models.KnowledgeChunks.aggregate<TSectionRow>([
      { $match: filter },
      { $sort: { sourceType: 1, sourceId: 1, chunkIndex: 1 } },
      { $limit: MAX_INDEXED_CHUNKS },
      {
        $project: {
          headingPath: 1,
          title: 1,
          head: { $substrCP: ['$content', 0, SECTION_HEAD_CHARS] },
        },
      },
    ]),
    models.KnowledgeChunks.find(
      { $and: [filter, { priority: 'always' }] },
      { embedding: 0 },
    )
      .limit(MAX_ALWAYS_CHUNKS)
      .lean<IKnowledgeChunkDocument[]>(),
  ]);

  const { sections, lines, chunkIdsBySection } = buildKnowledgeIndex(rows);
  const hintsByTop = await loadAiKnowledgeRouteHints({
    models,
    agentId,
    sections,
  });

  return {
    kind: 'indexed',
    sections,
    indexText: lines
      .map(({ top, text }) => {
        const hints = hintsByTop.get(top);

        return hints?.length
          ? `${text} (asked as: ${hints.map((hint) => `"${hint}"`).join(', ')})`
          : text;
      })
      .join('\n'),
    chunkIdsBySection,
    alwaysChunks: alwaysDocs.map(mapSharedKnowledgeDocumentToChunk),
  };
};

export const searchAiAgentKnowledgeSection = async ({
  models,
  chunkIds,
  query,
}: {
  models: IModels;
  chunkIds: string[];
  query: string;
}) => {
  if (!chunkIds.length) {
    return [];
  }

  const docs = await models.KnowledgeChunks.find(
    { _id: { $in: chunkIds } },
    { embedding: 0 },
  )
    .sort({ sourceId: 1, chunkIndex: 1 })
    .lean<IKnowledgeChunkDocument[]>();
  const chunks = docs.map(mapSharedKnowledgeDocumentToChunk);
  const ranked = query.trim()
    ? retrieveAiKnowledgeChunks({
        chunks,
        query: { text: query },
        config: {
          topK: SECTION_RESULT_TOP_K,
          maxContextBytes: SECTION_RESULT_MAX_BYTES,
          includeAlways: false,
        },
      }).chunks
    : [];

  // The chosen section is already the relevance signal; a query whose words
  // appear nowhere inside it must not empty the result.
  return ranked.length
    ? ranked
    : fitChunksWithinBytes(chunks, SECTION_RESULT_MAX_BYTES).chunks;
};

// Section names are written by the organization and need not say what they
// hold, so a chosen section only ranks its passages higher: the query is
// matched against the whole knowledge and a misleading name cannot hide it.
export const searchAiAgentKnowledgeByQuery = async ({
  models,
  agentId,
  agent,
  query,
  sections,
  chunkIds,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
  query: string;
  sections: string[];
  chunkIds: string[];
}) => {
  const sectionDocs = chunkIds.length
    ? await models.KnowledgeChunks.find(
        { _id: { $in: chunkIds } },
        { embedding: 0 },
      ).lean<IKnowledgeChunkDocument[]>()
    : [];

  return searchAiAgentKnowledge({
    models,
    agentId,
    agent,
    searchText: query,
    keywords: sections,
    extraCandidates: sectionDocs.map(mapSharedKnowledgeDocumentToChunk),
    limits: {
      topK: SECTION_RESULT_TOP_K,
      maxContextBytes: SECTION_RESULT_MAX_BYTES,
    },
  });
};
