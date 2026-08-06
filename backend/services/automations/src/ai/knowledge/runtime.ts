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

const stringifyRuntimeValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value == null) {
    return '';
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
};

const buildRuntimeInputText = ({
  inputData,
  aiContext,
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
}) => {
  const explicitInput = stringifyRuntimeValue(inputData);
  const latestUserMessage = stringifyRuntimeValue(aiContext?.input?.text);
  const actionInput =
    explicitInput && explicitInput !== latestUserMessage ? explicitInput : '';
  const history = (aiContext?.history || [])
    .filter((item) => item.text?.trim())
    .slice(-5)
    .map((item) => `${item.role || item.type || 'context'}: ${item.text}`)
    .join('\n');
  const facts = stringifyRuntimeValue(aiContext?.facts);

  return [
    latestUserMessage ? `Latest user message:\n${latestUserMessage}` : '',
    history ? `Relevant history:\n${history}` : '',
    facts && facts !== '{}' ? `Known facts:\n${facts}` : '',
    actionInput ? `Action input:\n${actionInput}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
};

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
          { title: { $regex: terms.join('|'), $options: 'i' } },
        ],
      })
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

  if (!chunksById.size) {
    collect(
      await models.KnowledgeChunks.find({
        agentId,
        sourceType: AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE,
      })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean<IKnowledgeChunkDocument[]>(),
    );
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

      if (resolveKnowledgeSourceScope(source) === 'all') {
        return { sourceType };
      }

      return source.sourceIds.length
        ? { sourceType, sourceId: { $in: source.sourceIds } }
        : null;
    })
    .filter((filter): filter is NonNullable<typeof filter> => !!filter);

  if (!sourceFilters.length) {
    return [];
  }

  const sourceFilter = { $or: sourceFilters };
  const terms = extractKnowledgeTerms(searchText, 32);
  const chunksById = new Map<string, TAiKnowledgeChunk>();
  const collect = (docs: TAiKnowledgeChunk[]) => {
    for (const doc of docs) {
      chunksById.set(String(doc.id), doc);
    }
  };
  const mapDocuments = (docs: IKnowledgeChunkDocument[]) =>
    docs.map(mapSharedKnowledgeDocumentToChunk);

  collect(
    mapDocuments(
      await models.KnowledgeChunks.find({
        $and: [sourceFilter, { priority: 'always' }],
      })
        .limit(20)
        .lean<IKnowledgeChunkDocument[]>(),
    ),
  );

  if (!terms.length) {
    return filterSharedKnowledgeChunksByAgentBindings({
      models,
      agentId,
      chunks: Array.from(chunksById.values()),
    });
  }

  const titleMatcher = new RegExp(terms.map(escapeRegex).join('|'), 'i');

  collect(
    mapDocuments(
      await models.KnowledgeChunks.find({
        $and: [
          sourceFilter,
          {
            $or: [
              { topics: { $in: terms } },
              { keywords: { $in: terms } },
              { title: titleMatcher },
            ],
          },
        ],
      })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean<IKnowledgeChunkDocument[]>(),
    ),
  );

  try {
    collect(
      mapDocuments(
        await models.KnowledgeChunks.find(
          {
            $and: [sourceFilter, { $text: { $search: searchText } }],
          },
          { score: { $meta: 'textScore' } },
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(MAX_CANDIDATE_CHUNKS)
          .lean<IKnowledgeChunkDocument[]>(),
      ),
    );
  } catch (_error) {
    return filterSharedKnowledgeChunksByAgentBindings({
      models,
      agentId,
      chunks: Array.from(chunksById.values()),
    });
  }

  return filterSharedKnowledgeChunksByAgentBindings({
    models,
    agentId,
    chunks: Array.from(chunksById.values()),
  });
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

export const retrieveAiAgentKnowledgeContextFiles = async ({
  models,
  agentId,
  agent,
  actionConfig,
  inputData,
  aiContext,
}: TAiKnowledgeRuntimeParams): Promise<TAiAgentLoadedContextFile[]> => {
  const retrieval = agent.context.retrieval;

  if (!retrieval?.enabled) {
    return [];
  }

  const inputText = buildRuntimeInputText({ inputData, aiContext });
  const actionText = buildActionSearchText(actionConfig);
  const searchText =
    actionConfig.goalType === 'generateText'
      ? inputText
      : [actionText, inputText].filter(Boolean).join('\n\n');

  if (!searchText.trim()) {
    return [];
  }

  const [agentCandidates, sharedCandidates] = await Promise.all([
    getCandidateChunks({
      models,
      agentId,
      searchText,
    }),
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

  const result = retrieveAiKnowledgeChunks({
    chunks: candidates,
    query: { text: searchText },
    config: {
      topK: retrieval.topK,
      maxContextBytes: retrieval.maxContextBytes,
      minScore: retrieval.minScore,
    },
  });

  if (!result.chunks.length) {
    return [];
  }

  return [
    {
      id: `retrieved-knowledge:${agentId}`,
      key: `retrieved-knowledge:${agentId}`,
      name: 'Retrieved knowledge',
      bytes: result.totalBytes,
      content: formatAiKnowledgeChunksForPrompt(result.chunks),
    },
  ];
};
