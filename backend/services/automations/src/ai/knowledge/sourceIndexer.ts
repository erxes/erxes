import {
  buildKnowledgeSourceType,
  sendCoreModuleProducer,
  type TAiKnowledgeSourceReference,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import { TAutomationProducers } from 'erxes-api-shared/core-modules';
import type { IModels } from '../../connectionResolver';
import type { IAiAgentKnowledgeSourceBindingDocument } from '../../mongo/aiAgentKnowledgeSourceBinding';
import type { TAiAgentKnowledgeSource } from '../aiAgent';
import { indexKnowledgeDocument } from './sharedIndexer';

type TKnowledgeSourceBinding = Pick<
  IAiAgentKnowledgeSourceBindingDocument,
  'agentId' | 'pluginName' | 'moduleName' | 'sourceKey' | 'sourceId'
>;

type TKnowledgeSourceGroup = Omit<
  TKnowledgeSourceBinding,
  'agentId' | 'sourceId'
> & {
  sourceIds: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isKnowledgeDocument = (value: unknown): value is TKnowledgeDocument => {
  if (
    !isRecord(value) ||
    !isRecord(value.source) ||
    !isRecord(value.metadata)
  ) {
    return false;
  }

  return (
    typeof value.source.type === 'string' &&
    typeof value.source.id === 'string' &&
    typeof value.source.version === 'string' &&
    typeof value.source.updatedAt === 'string' &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    (value.metadata.visibility === 'public' ||
      value.metadata.visibility === 'internal')
  );
};

const getBindingKey = (binding: TKnowledgeSourceBinding) =>
  `${binding.pluginName}:${binding.moduleName}:${binding.sourceKey}:${binding.sourceId}`;

const getSourceType = (
  source: Pick<
    TKnowledgeSourceBinding,
    'pluginName' | 'moduleName' | 'sourceKey'
  >,
) =>
  buildKnowledgeSourceType({
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    key: source.sourceKey,
  });

const toBindings = ({
  agentId,
  sources,
}: {
  agentId: string;
  sources: TAiAgentKnowledgeSource[];
}): TKnowledgeSourceBinding[] => {
  const bindings = new Map<string, TKnowledgeSourceBinding>();

  for (const source of sources) {
    for (const sourceId of source.sourceIds) {
      const binding = {
        agentId,
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        sourceKey: source.key,
        sourceId,
      };

      bindings.set(getBindingKey(binding), binding);
    }
  }

  return [...bindings.values()];
};

const groupBindings = (bindings: TKnowledgeSourceBinding[]) => {
  const groups = new Map<string, TKnowledgeSourceGroup>();

  for (const binding of bindings) {
    const key = `${binding.pluginName}:${binding.moduleName}:${binding.sourceKey}`;
    const existing = groups.get(key);

    if (existing) {
      existing.sourceIds.push(binding.sourceId);
      continue;
    }

    groups.set(key, {
      pluginName: binding.pluginName,
      moduleName: binding.moduleName,
      sourceKey: binding.sourceKey,
      sourceIds: [binding.sourceId],
    });
  }

  return [...groups.values()];
};

const loadKnowledgeDocuments = async ({
  subdomain,
  source,
}: {
  subdomain: string;
  source: TKnowledgeSourceGroup;
}) => {
  const response: unknown = await sendCoreModuleProducer({
    subdomain,
    pluginName: source.pluginName,
    moduleName: 'automations',
    producerName: TAutomationProducers.LOAD_AI_KNOWLEDGE_DOCUMENTS,
    input: {
      moduleName: source.moduleName,
      sourceKey: source.sourceKey,
      sourceIds: source.sourceIds,
    },
    defaultValue: [],
  });

  if (!Array.isArray(response)) {
    return [];
  }

  const sourceType = getSourceType(source);

  return response.filter(
    (document): document is TKnowledgeDocument =>
      isKnowledgeDocument(document) &&
      document.source.type === sourceType &&
      source.sourceIds.includes(document.source.id),
  );
};

const cleanupSourceIfUnused = async ({
  models,
  binding,
}: {
  models: IModels;
  binding: TKnowledgeSourceBinding;
}) => {
  const existingBinding = await models.AiAgentKnowledgeSourceBindings.exists({
    pluginName: binding.pluginName,
    moduleName: binding.moduleName,
    sourceKey: binding.sourceKey,
    sourceId: binding.sourceId,
  });

  if (existingBinding) {
    return false;
  }

  await models.KnowledgeChunks.deleteMany({
    sourceType: getSourceType(binding),
    sourceId: binding.sourceId,
  });

  return true;
};

const refreshKnowledgeSourceGroup = async ({
  models,
  subdomain,
  source,
}: {
  models: IModels;
  subdomain: string;
  source: TKnowledgeSourceGroup;
}) => {
  const bindingSelector = {
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    sourceKey: source.sourceKey,
    sourceId: { $in: source.sourceIds },
  };

  await models.AiAgentKnowledgeSourceBindings.updateMany(bindingSelector, {
    $set: { status: 'indexing' },
    $unset: { indexError: 1 },
  });

  let documents: TKnowledgeDocument[];

  try {
    documents = await loadKnowledgeDocuments({ subdomain, source });
  } catch (error) {
    await models.AiAgentKnowledgeSourceBindings.updateMany(bindingSelector, {
      $set: {
        status: 'failed',
        indexError:
          error instanceof Error
            ? error.message
            : 'Knowledge source could not be loaded.',
      },
    });

    return 0;
  }
  const documentsBySourceId = new Map(
    documents.map((document) => [document.source.id, document]),
  );

  for (const sourceId of source.sourceIds) {
    const document = documentsBySourceId.get(sourceId);

    if (document) {
      try {
        const result = await indexKnowledgeDocument({ models, document });

        await models.AiAgentKnowledgeSourceBindings.updateMany(
          { ...bindingSelector, sourceId },
          {
            $set: {
              status: 'indexed',
              chunkCount: result.chunkCount,
              indexedAt: new Date(),
            },
            $unset: { indexError: 1 },
          },
        );
      } catch (error) {
        await models.AiAgentKnowledgeSourceBindings.updateMany(
          { ...bindingSelector, sourceId },
          {
            $set: {
              status: 'failed',
              indexError:
                error instanceof Error
                  ? error.message
                  : 'Knowledge indexing failed.',
            },
          },
        );
      }

      continue;
    }

    await models.KnowledgeChunks.deleteMany({
      sourceType: getSourceType(source),
      sourceId,
    });

    await models.AiAgentKnowledgeSourceBindings.updateMany(
      { ...bindingSelector, sourceId },
      {
        $set: {
          status: 'skipped',
          chunkCount: 0,
          indexError: 'The source is unavailable or not published.',
        },
      },
    );
  }

  return documents.length;
};

export const syncAiAgentKnowledgeSources = async ({
  models,
  subdomain,
  agentId,
  sources,
}: {
  models: IModels;
  subdomain: string;
  agentId: string;
  sources: TAiAgentKnowledgeSource[];
}) => {
  const previousBindings = await models.AiAgentKnowledgeSourceBindings.find({
    agentId,
  }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
  const nextBindings = toBindings({ agentId, sources });
  const nextBindingKeys = new Set(nextBindings.map(getBindingKey));

  await models.AiAgentKnowledgeSourceBindings.deleteMany({ agentId });

  if (nextBindings.length) {
    await models.AiAgentKnowledgeSourceBindings.insertMany(nextBindings, {
      ordered: true,
    });
  }

  const removedBindings = previousBindings.filter(
    (binding) => !nextBindingKeys.has(getBindingKey(binding)),
  );
  const removedChunks = await Promise.all(
    removedBindings.map((binding) =>
      cleanupSourceIfUnused({ models, binding }),
    ),
  );
  const groups = groupBindings(nextBindings);
  const indexedDocumentCounts = await Promise.all(
    groups.map((source) =>
      refreshKnowledgeSourceGroup({ models, subdomain, source }),
    ),
  );

  return {
    bindingCount: nextBindings.length,
    indexedDocumentCount: indexedDocumentCounts.reduce(
      (sum, count) => sum + count,
      0,
    ),
    removedSourceCount: removedChunks.filter(Boolean).length,
  };
};

export const refreshAiKnowledgeSource = async ({
  models,
  subdomain,
  source,
}: {
  models: IModels;
  subdomain: string;
  source: TAiKnowledgeSourceReference;
}) => {
  const bindings = await models.AiAgentKnowledgeSourceBindings.find({
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    sourceKey: source.key,
    sourceId: source.sourceId,
  }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();

  if (!bindings.length) {
    await models.KnowledgeChunks.deleteMany({
      sourceType: buildKnowledgeSourceType(source),
      sourceId: source.sourceId,
    });

    return { indexedDocumentCount: 0, status: 'unbound' as const };
  }

  const indexedDocumentCount = await refreshKnowledgeSourceGroup({
    models,
    subdomain,
    source: {
      pluginName: source.pluginName,
      moduleName: source.moduleName,
      sourceKey: source.key,
      sourceIds: [source.sourceId],
    },
  });

  return { indexedDocumentCount, status: 'refreshed' as const };
};

export const getAiAgentKnowledgeSourceStatuses = async ({
  models,
  agentId,
}: {
  models: IModels;
  agentId: string;
}) =>
  models.AiAgentKnowledgeSourceBindings.find(
    { agentId },
    {
      pluginName: 1,
      moduleName: 1,
      sourceKey: 1,
      sourceId: 1,
      status: 1,
      chunkCount: 1,
      indexedAt: 1,
      indexError: 1,
    },
  ).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
