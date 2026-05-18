import type { IModels } from '../../connectionResolver';
import type { TAiAgentInput } from '../aiAgent';
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
  const currentInput =
    explicitInput || stringifyRuntimeValue(aiContext?.input?.text);
  const history = (aiContext?.history || [])
    .filter((item) => item.text?.trim())
    .slice(-5)
    .map((item) => `${item.role || item.type || 'context'}: ${item.text}`)
    .join('\n');
  const facts = stringifyRuntimeValue(aiContext?.facts);

  return [
    history ? `Relevant history:\n${history}` : '',
    facts && facts !== '{}' ? `Known facts:\n${facts}` : '',
    currentInput ? `Current input:\n${currentInput}` : '',
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

const mapDocumentToChunk = (doc: any): TAiKnowledgeChunk => ({
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
  const chunksById = new Map<string, any>();

  const collect = (docs: any[]) => {
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
      .lean(),
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
        .lean(),
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
          .lean(),
      );
    } catch (error) {
      console.error('AI knowledge text search failed:', error);
    }
  }

  if (!chunksById.size) {
    collect(
      await models.AiAgentKnowledgeChunks.find({ agentId })
        .limit(MAX_CANDIDATE_CHUNKS)
        .lean(),
    );
  }

  return Array.from(chunksById.values()).map(mapDocumentToChunk);
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

  const candidates = await getCandidateChunks({
    models,
    agentId,
    searchText,
  });

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
