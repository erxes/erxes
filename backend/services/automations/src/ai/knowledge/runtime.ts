import type { IModels } from '../../connectionResolver';
import type { IKnowledgeChunkDocument } from '../../mongo/knowledgeChunk';
import type { TAiAgentInput, TAiAgentKnowledgeSource } from '../aiAgent';
import { buildKnowledgeSourceType } from 'erxes-api-shared/utils';
import type { TAiAgentLoadedContextFile } from '../aiAgent/context';
import { TAiAgentActionConfig } from '../aiAction/contract';
import { extractKnowledgeTerms } from './normalize';
import {
  formatAiKnowledgeChunksForPrompt,
  retrieveAiKnowledgeChunks,
} from './retrieve';
import { TAiKnowledgeChunk } from './types';
import {
  AI_SEARCH_HISTORY_LIMIT,
  buildAiInputFromContext,
} from '../aiAction/context';
import { type TAiContext } from 'erxes-api-shared/core-modules';
import {
  AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
  resolveKnowledgeSourceScope,
} from './sourceConfig';

type TAiKnowledgeRuntimeParams = {
  subdomain: string;
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
  actionConfig: TAiAgentActionConfig;
  inputData: unknown;
  aiContext?: TAiContext | null;
};

const MAX_CANDIDATE_CHUNKS = 300;
const MIN_CANDIDATE_CHUNKS_PER_SOURCE = 25;
const ALWAYS_INCLUDED_CHUNKS_PER_SOURCE = 20;

const buildActionSearchText = (actionConfig: TAiAgentActionConfig) => {
  if (actionConfig.goalType === 'generateText') {
    return actionConfig.prompt || '';
  }

  if (actionConfig.goalType === 'splitTopic') {
    return actionConfig.topics
      .map(
        (topic) =>
          `${topic.topicName || ''} ${topic.prompt || ''} ${topic.id || ''}`,
      )
      .join('\n');
  }

  return actionConfig.objectFields
    .map(
      (field) =>
        `${field.fieldName || ''} ${field.dataType || ''} ${
          field.validation || ''
        } ${field.prompt || ''}`,
    )
    .join('\n');
};

const mapSharedKnowledgeDocumentToChunk = (
  doc: IKnowledgeChunkDocument,
): TAiKnowledgeChunk => {
  return {
    id: doc._id,
    sourceType: doc.sourceType,
    sourceId: doc.sourceId,
    sourceUrl: doc.sourceUrl,
    agentId: doc.agentId,
    fileId: doc.fileId || doc.sourceId,
    fileName: doc.fileName || doc.title,
    chunkIndex: doc.chunkIndex,
    title: doc.title,
    headingPath: doc.headingPath || [],
    content: doc.content,
    contentHash: doc.contentHash,
    byteSize: doc.byteSize,
    tokenCount: doc.tokenCount || 0,
    topics: doc.topics || [],
    keywords: doc.keywords || [],
    priority: doc.priority || 'normal',
    language: doc.language || 'unknown',
    metadata: doc.metadata || {},
  };
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCandidateChunks = async ({
  models,
  agentId,
  searchText,
}: {
  models: IModels;
  agentId: string;
  searchText: string;
}) => {
  const terms = extractKnowledgeTerms(searchText, 32);
  const chunksById = new Map<string, IKnowledgeChunkDocument>();

  const collect = (docs: IKnowledgeChunkDocument[]) => {
    for (const doc of docs) {
      chunksById.set(String(doc._id), doc);
    }
  };

  collect(
    await models.KnowledgeChunks.find({
      agentId,
      sourceType: AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
      priority: 'always',
    })
      .limit(20)
      .lean<IKnowledgeChunkDocument[]>(),
  );

  if (terms.length) {
    collect(
      await models.KnowledgeChunks.find({
        agentId,
        sourceType: AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
        $or: [
          { topics: { $in: terms } },
          { keywords: { $in: terms } },
          { title: { $regex: terms.map(escapeRegex).join('|'), $options: 'i' } },
        ],
      })
        // No relevance signal on this path, so prefer the freshest content
        // instead of natural collection order.
        .sort({ sourceUpdatedAt: -1 })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean<IKnowledgeChunkDocument[]>(),
    );

    try {
      collect(
        await models.KnowledgeChunks.find(
          {
            agentId,
            sourceType: AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
            $text: { $search: searchText },
          },
          { score: { $meta: 'textScore' } },
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(MAX_CANDIDATE_CHUNKS)
          .lean<IKnowledgeChunkDocument[]>(),
      );
    } catch (error) {
      console.error('AI knowledge text search failed:', error);
    }
  }

  return Array.from(chunksById.values()).map(mapSharedKnowledgeDocumentToChunk);
};

const getSharedKnowledgeCandidateChunks = async ({
  models,
  agentId,
  searchText,
  sources,
}: {
  models: IModels;
  agentId: string;
  searchText: string;
  sources: TAiAgentKnowledgeSource[];
}) => {
  const sourceFilters = sources
    .map((source) => {
      const sourceType = buildKnowledgeSourceType({
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        key: source.key,
      });

      // A plugin marks its staff-only documents internal, and a reply may be
      // customer-facing. Agent-owned files carry the same flag for a different
      // reason and are gathered on their own path.
      const base = { sourceType, visibility: { $ne: 'internal' } };

      if (resolveKnowledgeSourceScope(source) === 'all') {
        return base;
      }

      return source.sourceIds.length
        ? { ...base, sourceId: { $in: source.sourceIds } }
        : null;
    })
    .filter((filter): filter is NonNullable<typeof filter> => !!filter);

  if (!sourceFilters.length) {
    return [];
  }

  const terms = extractKnowledgeTerms(searchText, 32);
  const chunksById = new Map<string, TAiKnowledgeChunk>();
  const collect = (docs: IKnowledgeChunkDocument[]) => {
    for (const doc of docs.map(mapSharedKnowledgeDocumentToChunk)) {
      chunksById.set(String(doc.id), doc);
    }
  };
  const finish = () =>
    filterSharedKnowledgeChunksByAgentBindings({
      models,
      agentId,
      chunks: Array.from(chunksById.values()),
    });
  // A shared pool lets a large source crowd every other one out of the
  // candidate window before scoring ever runs.
  const perSourceLimit = Math.max(
    Math.ceil(MAX_CANDIDATE_CHUNKS / sourceFilters.length),
    MIN_CANDIDATE_CHUNKS_PER_SOURCE,
  );
  const titleMatcher = terms.length
    ? new RegExp(terms.map(escapeRegex).join('|'), 'i')
    : null;

  for (const sourceFilter of sourceFilters) {
    collect(
      await models.KnowledgeChunks.find({
        ...sourceFilter,
        priority: 'always',
      })
        .limit(ALWAYS_INCLUDED_CHUNKS_PER_SOURCE)
        .lean<IKnowledgeChunkDocument[]>(),
    );

    if (!titleMatcher) {
      continue;
    }

    collect(
      await models.KnowledgeChunks.find({
        ...sourceFilter,
        $or: [
          { topics: { $in: terms } },
          { keywords: { $in: terms } },
          { title: titleMatcher },
        ],
      })
        // No relevance signal on this path, so prefer the freshest content
        // instead of natural collection order.
        .sort({ sourceUpdatedAt: -1 })
        .limit(perSourceLimit)
        .lean<IKnowledgeChunkDocument[]>(),
    );

    try {
      collect(
        await models.KnowledgeChunks.find(
          { ...sourceFilter, $text: { $search: searchText } },
          { score: { $meta: 'textScore' } },
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(perSourceLimit)
          .lean<IKnowledgeChunkDocument[]>(),
      );
    } catch (_error) {
      return finish();
    }
  }

  return finish();
};

// A shared chunk is only visible to agents that actually bound its source,
// since the chunk store is shared across agents in the tenant.
const filterSharedKnowledgeChunksByAgentBindings = async ({
  models,
  agentId,
  chunks,
}: {
  models: IModels;
  agentId: string;
  chunks: TAiKnowledgeChunk[];
}) => {
  const sourceIds = [
    ...new Set(
      chunks
        .map((chunk) => chunk.sourceId)
        .filter((sourceId): sourceId is string => !!sourceId),
    ),
  ];

  if (!sourceIds.length) {
    return chunks;
  }

  const bindings = await models.AiAgentKnowledgeSourceBindings.find(
    { agentId, sourceId: { $in: sourceIds }, status: 'indexed' },
    { sourceId: 1 },
  ).lean<Array<{ sourceId: string }>>();
  const allowedSourceIds = new Set(bindings.map((binding) => binding.sourceId));

  return chunks.filter(
    (chunk) => chunk.sourceId && allowedSourceIds.has(chunk.sourceId),
  );
};

// The one place that turns a search string into ranked chunks. Both the
// prompt-mode retrieval and the search_knowledge tool go through here.
export const searchAiAgentKnowledge = async ({
  models,
  agentId,
  agent,
  searchText,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
  searchText: string;
}): Promise<TAiKnowledgeChunk[]> => {
  const retrieval = agent.context.retrieval;

  if (!retrieval?.enabled || !searchText.trim()) {
    return [];
  }

  const [agentCandidates, sharedCandidates] = await Promise.all([
    getCandidateChunks({ models, agentId, searchText }),
    getSharedKnowledgeCandidateChunks({
      models,
      agentId,
      searchText,
      sources: agent.context.knowledgeSources || [],
    }),
  ]);
  const candidates = [...agentCandidates, ...sharedCandidates];

  if (!candidates.length) {
    return [];
  }

  return retrieveAiKnowledgeChunks({
    chunks: candidates,
    query: { text: searchText },
    config: {
      topK: retrieval.topK,
      maxContextBytes: retrieval.maxContextBytes,
      minScore: retrieval.minScore,
    },
  }).chunks;
};

export const retrieveAiAgentKnowledgeContextFiles = async ({
  models,
  agentId,
  agent,
  actionConfig,
  inputData,
  aiContext,
}: TAiKnowledgeRuntimeParams): Promise<TAiAgentLoadedContextFile[]> => {
  const inputText = buildAiInputFromContext({
    inputData,
    aiContext,
    historyLimit: AI_SEARCH_HISTORY_LIMIT,
  });
  const actionText = buildActionSearchText(actionConfig);
  const chunks = await searchAiAgentKnowledge({
    models,
    agentId,
    agent,
    searchText:
      actionConfig.goalType === 'generateText'
        ? inputText
        : [actionText, inputText].filter(Boolean).join('\n\n'),
  });

  if (!chunks.length) {
    return [];
  }

  return [
    {
      id: `retrieved-knowledge:${agentId}`,
      key: `retrieved-knowledge:${agentId}`,
      name: 'Retrieved knowledge',
      bytes: chunks.reduce((sum, chunk) => sum + chunk.byteSize, 0),
      content: formatAiKnowledgeChunksForPrompt(chunks),
    },
  ];
};
