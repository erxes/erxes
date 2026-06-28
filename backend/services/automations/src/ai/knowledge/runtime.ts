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
  PRODUCT_KNOWLEDGE_SOURCE,
  PRODUCT_KNOWLEDGE_SOURCE_TYPE,
  isProductKnowledgeSource,
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
const MAX_ALWAYS_INCLUDED_PRODUCT_CHUNKS = 50;

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

const buildLatestUserText = ({
  inputData,
  aiContext,
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
}) =>
  stringifyRuntimeValue(aiContext?.input?.text) ||
  stringifyRuntimeValue(inputData);

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

      if (source.sourceIds.length) {
        return {
          sourceType,
          sourceId: { $in: source.sourceIds },
        };
      }

      if (isProductKnowledgeSource(source)) {
        return { sourceType };
      }

      return null;
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

const filterSharedKnowledgeChunksByAgentBindings = async ({
  models,
  agentId,
  chunks,
}: {
  models: IModels;
  agentId: string;
  chunks: TAiKnowledgeChunk[];
}) => {
  const productSourceIds = [
    ...new Set(
      chunks
        .filter((chunk) => chunk.sourceType === PRODUCT_KNOWLEDGE_SOURCE_TYPE)
        .map((chunk) => chunk.sourceId)
        .filter((sourceId): sourceId is string => !!sourceId),
    ),
  ];

  if (!productSourceIds.length) {
    return chunks;
  }

  const bindings = await models.AiAgentKnowledgeSourceBindings.find(
    {
      agentId,
      pluginName: PRODUCT_KNOWLEDGE_SOURCE.pluginName,
      moduleName: PRODUCT_KNOWLEDGE_SOURCE.moduleName,
      sourceKey: PRODUCT_KNOWLEDGE_SOURCE.key,
      sourceId: { $in: productSourceIds },
      status: 'indexed',
    },
    { sourceId: 1 },
  ).lean<Array<{ sourceId: string }>>();
  const allowedProductSourceIds = new Set(
    bindings.map((binding) => binding.sourceId),
  );

  return chunks.filter(
    (chunk) =>
      chunk.sourceType !== PRODUCT_KNOWLEDGE_SOURCE_TYPE ||
      (chunk.sourceId && allowedProductSourceIds.has(chunk.sourceId)),
  );
};

const getSelectedProductSourceIds = (sources: TAiAgentKnowledgeSource[]) => [
  ...new Set(
    sources
      .filter(isProductKnowledgeSource)
      .flatMap((source) => source.sourceIds)
      .filter(Boolean),
  ),
];

const getSearchableKnowledgeSources = ({
  sources,
  alwaysIncludedProductSourceIds,
}: {
  sources: TAiAgentKnowledgeSource[];
  alwaysIncludedProductSourceIds: string[];
}) => {
  if (!alwaysIncludedProductSourceIds.length) {
    return sources;
  }

  return sources.filter((source) => !isProductKnowledgeSource(source));
};

const getAlwaysIncludedProductCatalogChunks = async ({
  models,
  agentId,
  sources,
}: {
  models: IModels;
  agentId: string;
  sources: TAiAgentKnowledgeSource[];
}) => {
  const hasProductKnowledgeScope = sources.some(isProductKnowledgeSource);

  if (!hasProductKnowledgeScope) {
    return [];
  }

  const selectedProductSourceIds = getSelectedProductSourceIds(sources);
  const materializedBindings =
    await models.AiAgentKnowledgeSourceBindings.find(
      {
        agentId,
        pluginName: PRODUCT_KNOWLEDGE_SOURCE.pluginName,
        moduleName: PRODUCT_KNOWLEDGE_SOURCE.moduleName,
        sourceKey: PRODUCT_KNOWLEDGE_SOURCE.key,
        materialized: true,
        status: 'indexed',
      },
      { sourceId: 1 },
    )
      .limit(MAX_ALWAYS_INCLUDED_PRODUCT_CHUNKS + 1)
      .lean<Array<{ sourceId: string }>>();
  const productSourceIds = [
    ...new Set([
      ...selectedProductSourceIds,
      ...materializedBindings.map((binding) => binding.sourceId),
    ]),
  ].filter(Boolean);

  if (
    !productSourceIds.length ||
    productSourceIds.length > MAX_ALWAYS_INCLUDED_PRODUCT_CHUNKS
  ) {
    return [];
  }

  return (
    await models.KnowledgeChunks.find({
      sourceType: PRODUCT_KNOWLEDGE_SOURCE_TYPE,
      sourceId: { $in: productSourceIds },
    })
      .sort({ title: 1, chunkIndex: 1 })
      .limit(MAX_ALWAYS_INCLUDED_PRODUCT_CHUNKS)
      .lean<IKnowledgeChunkDocument[]>()
  ).map(mapSharedKnowledgeDocumentToChunk);
};

const normalizeProductMatchText = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();

const extractProductFact = (content: string, field: string) => {
  const match = content.match(new RegExp(`(?:^|\\n)${field}:\\s*([^\\n]+)`));

  return match?.[1]?.trim();
};

const getMatchedProductCatalogChunks = ({
  chunks,
  latestUserText,
}: {
  chunks: TAiKnowledgeChunk[];
  latestUserText: string;
}) => {
  const normalizedUserText = normalizeProductMatchText(latestUserText);
  const terms = extractKnowledgeTerms(normalizedUserText);

  if (!normalizedUserText) {
    return [];
  }

  return chunks.filter((chunk) => {
    const name = extractProductFact(chunk.content, 'Name');
    const shortName = extractProductFact(chunk.content, 'Short name');
    const code = extractProductFact(chunk.content, 'Code');

    return [name, shortName, code]
      .filter(Boolean)
      .map((value) => normalizeProductMatchText(value || ''))
      .some(
        (value) =>
          normalizedUserText.includes(value) ||
          value.includes(normalizedUserText) ||
          terms.some((term) => value.includes(term)),
      );
  });
};

const formatProductMatchSummary = (chunks: TAiKnowledgeChunk[]) => {
  if (!chunks.length) {
    return '';
  }

  return [
    'Current product catalog match for the latest user message:',
    ...chunks.map((chunk) => {
      const name = extractProductFact(chunk.content, 'Name') || chunk.title;
      const code = extractProductFact(chunk.content, 'Code');
      const price = extractProductFact(chunk.content, 'Price');
      const status = extractProductFact(chunk.content, 'Status');

      return [
        `- ${name}`,
        code ? `  Code: ${code}` : '',
        price ? `  Price: ${price}` : '',
        status ? `  Status: ${status}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }),
    'Instruction: if the customer asks whether they can buy or order one of these matched products, do not say it is unavailable. Say it is listed in the configured product catalog and use only the explicit facts above.',
    '',
  ].join('\n');
};

const buildProductCatalogContextFile = ({
  chunks,
  latestUserText,
}: {
  chunks: TAiKnowledgeChunk[];
  latestUserText: string;
}): TAiAgentLoadedContextFile | null => {
  if (!chunks.length) {
    return null;
  }

  const matchedChunks = getMatchedProductCatalogChunks({
    chunks,
    latestUserText,
  });
  const content = [
    'Authority: indexed product catalog.',
    'These are selected active products from the configured product knowledge scope.',
    'For product existence and explicit product facts, this catalog context has priority over uploaded files and knowledge base articles.',
    'Absence from uploaded files or knowledge base articles does not mean these products are unavailable.',
    'Do not deny products listed here unless this catalog context explicitly says they are deleted or inactive.',
    '',
    formatProductMatchSummary(matchedChunks),
    formatAiKnowledgeChunksForPrompt(chunks),
  ].join('\n');

  return {
    id: 'selected-product-catalog',
    key: 'selected-product-catalog',
    name: 'Product catalog',
    bytes: Buffer.byteLength(content, 'utf8'),
    content,
  };
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
  const latestUserText = buildLatestUserText({ inputData, aiContext });
  const actionText = buildActionSearchText(actionConfig);
  const searchText =
    actionConfig.goalType === 'generateText'
      ? inputText
      : [actionText, inputText].filter(Boolean).join('\n\n');
  const knowledgeSources = agent.context.knowledgeSources || [];
  const productCatalogChunks = await getAlwaysIncludedProductCatalogChunks({
    models,
    agentId,
    sources: knowledgeSources,
  });
  const productCatalogContext = buildProductCatalogContextFile({
    chunks: productCatalogChunks,
    latestUserText,
  });
  const searchableKnowledgeSources = getSearchableKnowledgeSources({
    sources: knowledgeSources,
    alwaysIncludedProductSourceIds: productCatalogChunks
      .map((chunk) => chunk.sourceId)
      .filter((sourceId): sourceId is string => !!sourceId),
  });
  const productContextFiles = [
    ...(productCatalogContext ? [productCatalogContext] : []),
  ];

  if (!searchText.trim()) {
    return productContextFiles;
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
      sources: searchableKnowledgeSources,
    }),
  ]);
  const candidates = [...agentCandidates, ...sharedCandidates];

  if (!candidates.length) {
    return productContextFiles;
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
    return productContextFiles;
  }

  return [
    ...productContextFiles,
    {
      id: `retrieved-knowledge:${agentId}`,
      key: `retrieved-knowledge:${agentId}`,
      name: 'Retrieved knowledge',
      bytes: result.totalBytes,
      content: formatAiKnowledgeChunksForPrompt(result.chunks),
    },
  ];
};
