import { createHash } from 'crypto';
import { buildKnowledgeSourceType } from 'erxes-api-shared/utils';
import type { TAiAgentKnowledgeSource } from '../aiAgent';

export const PRODUCT_KNOWLEDGE_SOURCE = {
  pluginName: 'core',
  moduleName: 'products',
  key: 'product.knowledge',
};

export const PRODUCT_KNOWLEDGE_SOURCE_TYPE = buildKnowledgeSourceType(
  PRODUCT_KNOWLEDGE_SOURCE,
);

export const AI_AGENT_FILE_KNOWLEDGE_SOURCE = {
  pluginName: 'automations',
  moduleName: 'aiAgent',
  key: 'context.file',
};

export const AI_AGENT_FILE_KNOWLEDGE_SOURCE_TYPE = buildKnowledgeSourceType(
  AI_AGENT_FILE_KNOWLEDGE_SOURCE,
);

export const buildAiAgentFileKnowledgeSourceId = ({
  agentId,
  fileId,
}: {
  agentId: string;
  fileId: string;
}) => `${agentId}:${fileId}`;

export type TKnowledgeSourceIdentity = {
  pluginName: string;
  moduleName: string;
  sourceKey: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && !!item)
    : [];

const uniqueStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const normalizedItems = value.map(stableValue);

    if (
      normalizedItems.every(
        (item) =>
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean',
      )
    ) {
      return [...normalizedItems].sort();
    }

    return normalizedItems;
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = stableValue(value[key]);
      return result;
    }, {});
};

export const stableStringify = (value: unknown) =>
  JSON.stringify(stableValue(value));

export const hashKnowledgeSourceConfig = ({
  sourceIds,
  config,
}: {
  sourceIds: string[];
  config?: Record<string, unknown>;
}) =>
  createHash('sha256')
    .update(
      stableStringify({
        sourceIds: uniqueStrings(sourceIds),
        config: config || {},
      }),
    )
    .digest('hex');

export const getKnowledgeSourceIdentity = (
  source: Pick<TAiAgentKnowledgeSource, 'pluginName' | 'moduleName' | 'key'>,
): TKnowledgeSourceIdentity => ({
  pluginName: source.pluginName,
  moduleName: source.moduleName,
  sourceKey: source.key,
});

export const getKnowledgeSourceType = (
  source: Pick<
    TKnowledgeSourceIdentity,
    'pluginName' | 'moduleName' | 'sourceKey'
  >,
) =>
  buildKnowledgeSourceType({
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    key: source.sourceKey,
  });

export const isProductKnowledgeSource = (
  source: Pick<TAiAgentKnowledgeSource, 'pluginName' | 'moduleName' | 'key'>,
) =>
  source.pluginName === PRODUCT_KNOWLEDGE_SOURCE.pluginName &&
  source.moduleName === PRODUCT_KNOWLEDGE_SOURCE.moduleName &&
  source.key === PRODUCT_KNOWLEDGE_SOURCE.key;

export const hasProductScopeSelection = (
  source: Pick<TAiAgentKnowledgeSource, 'sourceIds' | 'config'>,
) => {
  const config = source.config || {};

  return (
    source.sourceIds.length > 0 ||
    toStringArray(config.includeProductIds).length > 0 ||
    toStringArray(config.productIds).length > 0 ||
    toStringArray(config.includeCategoryIds).length > 0 ||
    toStringArray(config.categoryIds).length > 0
  );
};

export const isMaterializedKnowledgeSource = (source: TAiAgentKnowledgeSource) =>
  isProductKnowledgeSource(source) && hasProductScopeSelection(source);
