import type { IModels } from '../../connectionResolver';
import type { IAiAgentKnowledgeChunkDocument } from '../../mongo/aiAgentKnowledgeChunk';
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
import { TAiContext } from 'erxes-api-shared/core-modules';

type TAiKnowledgeRuntimeParams = {
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

const mapDocumentToChunk = (
  doc: IAiAgentKnowledgeChunkDocument,
): TAiKnowledgeChunk => ({
  id: doc._id,
  agentId: doc.agentId,
  fileId: doc.fileId,
  fileName: doc.fileName,
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
});

const mapSharedKnowledgeDocumentToChunk = (
  doc: IKnowledgeChunkDocument,
): TAiKnowledgeChunk => {
  return {
    id: doc._id,
    sourceType: doc.sourceType,
    sourceId: doc.sourceId,
    sourceUrl: doc.sourceUrl,
    fileId: doc.sourceId,
    fileName: doc.title,
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
  const chunksById = new Map<string, IAiAgentKnowledgeChunkDocument>();

  const collect = (docs: IAiAgentKnowledgeChunkDocument[]) => {
    for (const doc of docs) {
      chunksById.set(String(doc._id), doc);
    }
  };

  collect(
    await models.AiAgentKnowledgeChunks.find({
      agentId,
      priority: 'always',
    })
      .limit(20)
      .lean<IAiAgentKnowledgeChunkDocument[]>(),
  );

  if (terms.length) {
    collect(
      await models.AiAgentKnowledgeChunks.find({
        agentId,
        $or: [
          { topics: { $in: terms } },
          { keywords: { $in: terms } },
          { title: { $regex: terms.join('|'), $options: 'i' } },
        ],
      })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean<IAiAgentKnowledgeChunkDocument[]>(),
    );

    try {
      collect(
        await models.AiAgentKnowledgeChunks.find(
          {
            agentId,
            $text: { $search: searchText },
          },
          { score: { $meta: 'textScore' } },
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(MAX_CANDIDATE_CHUNKS)
          .lean<IAiAgentKnowledgeChunkDocument[]>(),
      );
    } catch (error) {
      console.error('AI knowledge text search failed:', error);
    }
  }

  if (!chunksById.size) {
    collect(
      await models.AiAgentKnowledgeChunks.find({ agentId })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean<IAiAgentKnowledgeChunkDocument[]>(),
    );
  }

  return Array.from(chunksById.values()).map(mapDocumentToChunk);
};

const getSharedKnowledgeCandidateChunks = async ({
  models,
  searchText,
  sources,
}: {
  models: IModels;
  searchText: string;
  sources: TAiAgentKnowledgeSource[];
}) => {
  const sourceFilters = sources
    .filter((source) => source.sourceIds.length)
    .map((source) => ({
      sourceType: buildKnowledgeSourceType({
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        key: source.key,
      }),
      sourceId: { $in: source.sourceIds },
    }));

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
    return Array.from(chunksById.values());
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
    return Array.from(chunksById.values());
  }

  return Array.from(chunksById.values());
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
