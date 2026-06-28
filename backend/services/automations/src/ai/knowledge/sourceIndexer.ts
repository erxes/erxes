import {
  sendCoreModuleProducer,
  sendWorkerQueue,
  type TAiKnowledgeSourceReference,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import {
  TAutomationProducers,
  type TAiKnowledgeDocumentBatchResult,
} from 'erxes-api-shared/core-modules';
import type { IModels } from '../../connectionResolver';
import type { IAiAgentKnowledgeIndexRunDocument } from '../../mongo/aiAgentKnowledgeIndexRun';
import type { IAiAgentKnowledgeSourceBindingDocument } from '../../mongo/aiAgentKnowledgeSourceBinding';
import type { TAiAgentKnowledgeSource } from '../aiAgent';
import { indexKnowledgeDocument } from './sharedIndexer';
import {
  getKnowledgeSourceIdentity,
  getKnowledgeSourceType,
  hashKnowledgeSourceConfig,
  hasProductScopeSelection,
  isMaterializedKnowledgeSource,
  isProductKnowledgeSource,
  type TKnowledgeSourceIdentity,
} from './sourceConfig';

const SCOPE_BATCH_LIMIT = 500;

type TKnowledgeSourceBinding = Pick<
  IAiAgentKnowledgeSourceBindingDocument,
  | 'agentId'
  | 'pluginName'
  | 'moduleName'
  | 'sourceKey'
  | 'sourceId'
  | 'materialized'
  | 'configHash'
> & {
  _id?: string;
};

type TKnowledgeSourceGroup = TKnowledgeSourceIdentity & {
  sourceIds: string[];
  config?: Record<string, unknown>;
};

type TScopedSourceTarget = {
  agentId: string;
  source: TAiAgentKnowledgeSource;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && !!item)
    : [];

const uniqueStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

const buildMaterializedSourceConfig = (source: TAiAgentKnowledgeSource) => {
  if (!isProductKnowledgeSource(source)) {
    return source.config || {};
  }

  return {
    ...(source.config || {}),
    includeProductIds: uniqueStrings([
      ...toStringArray(source.config?.includeProductIds),
      ...toStringArray(source.config?.productIds),
      ...source.sourceIds,
    ]),
  };
};

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

const isBatchResult = (
  value: unknown,
): value is TAiKnowledgeDocumentBatchResult =>
  isRecord(value) &&
  Array.isArray(value.documents) &&
  typeof value.totalCount === 'number' &&
  typeof value.hasMore === 'boolean';

const getBindingKey = (binding: TKnowledgeSourceBinding) =>
  `${binding.agentId}:${binding.pluginName}:${binding.moduleName}:${binding.sourceKey}:${binding.sourceId}`;

const getSourceSelectionKey = (source: TKnowledgeSourceIdentity) =>
  `${source.pluginName}:${source.moduleName}:${source.sourceKey}`;

const sourceMatches = ({
  source,
  pluginName,
  moduleName,
  sourceKey,
}: {
  source: TAiAgentKnowledgeSource;
  pluginName: string;
  moduleName: string;
  sourceKey: string;
}) =>
  source.pluginName === pluginName &&
  source.moduleName === moduleName &&
  source.key === sourceKey;

const toDirectBindings = ({
  agentId,
  sources,
}: {
  agentId: string;
  sources: TAiAgentKnowledgeSource[];
}): TKnowledgeSourceBinding[] => {
  const bindings = new Map<string, TKnowledgeSourceBinding>();

  for (const source of sources) {
    if (isMaterializedKnowledgeSource(source)) {
      continue;
    }

    const identity = getKnowledgeSourceIdentity(source);

    for (const sourceId of source.sourceIds) {
      const binding = {
        agentId,
        ...identity,
        sourceId,
        materialized: false,
      };

      bindings.set(getBindingKey(binding), binding);
    }
  }

  return [...bindings.values()];
};

const groupBindings = (bindings: TKnowledgeSourceBinding[]) => {
  const groups = new Map<string, TKnowledgeSourceGroup>();

  for (const binding of bindings) {
    const key = getSourceSelectionKey(binding);
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
    producerName: TAutomationProducers.LOAD_AI_KNOWLEDGE_DOCUMENT_BATCH,
    input: {
      moduleName: source.moduleName,
      sourceKey: source.sourceKey,
      sourceIds: source.sourceIds,
      config: source.config,
      limit: Math.max(source.sourceIds.length, 1),
    },
    defaultValue: {
      documents: [],
      totalCount: 0,
      hasMore: false,
    },
  });

  if (!isBatchResult(response)) {
    return [];
  }

  const sourceType = getKnowledgeSourceType(source);
  const requestedSourceIds = new Set(source.sourceIds);

  return response.documents.filter(
    (document): document is TKnowledgeDocument =>
      isKnowledgeDocument(document) &&
      document.source.type === sourceType &&
      requestedSourceIds.has(document.source.id),
  );
};

const loadKnowledgeDocumentBatch = async ({
  subdomain,
  source,
  cursor,
  limit = SCOPE_BATCH_LIMIT,
  candidateSourceIds,
  skipTotalCount,
}: {
  subdomain: string;
  source: TKnowledgeSourceGroup;
  cursor?: string;
  limit?: number;
  candidateSourceIds?: string[];
  skipTotalCount?: boolean;
}) => {
  const response: unknown = await sendCoreModuleProducer({
    subdomain,
    pluginName: source.pluginName,
    moduleName: 'automations',
    producerName: TAutomationProducers.LOAD_AI_KNOWLEDGE_DOCUMENT_BATCH,
    input: {
      moduleName: source.moduleName,
      sourceKey: source.sourceKey,
      sourceIds: source.sourceIds,
      candidateSourceIds,
      config: source.config,
      cursor,
      limit,
      skipTotalCount,
    },
    defaultValue: {
      documents: [],
      totalCount: 0,
      hasMore: false,
    },
  });

  if (!isBatchResult(response)) {
    return {
      documents: [],
      totalCount: 0,
      hasMore: false,
    };
  }

  const sourceType = getKnowledgeSourceType(source);
  const candidateFilter = candidateSourceIds?.length
    ? new Set(candidateSourceIds)
    : null;
  const documents = response.documents.filter(
    (document): document is TKnowledgeDocument =>
      isKnowledgeDocument(document) &&
      document.source.type === sourceType &&
      (!candidateFilter || candidateFilter.has(document.source.id)),
  );

  return {
    ...response,
    documents,
  };
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
    sourceType: getKnowledgeSourceType(binding),
    sourceId: binding.sourceId,
  });

  return true;
};

const removeBindingAndCleanup = async ({
  models,
  binding,
}: {
  models: IModels;
  binding: TKnowledgeSourceBinding;
}) => {
  await models.AiAgentKnowledgeSourceBindings.deleteOne(
    binding._id
      ? { _id: binding._id }
      : {
          agentId: binding.agentId,
          pluginName: binding.pluginName,
          moduleName: binding.moduleName,
          sourceKey: binding.sourceKey,
          sourceId: binding.sourceId,
        },
  );

  return cleanupSourceIfUnused({ models, binding });
};

const upsertBinding = async ({
  models,
  binding,
  status,
  configHash,
  runId,
}: {
  models: IModels;
  binding: TKnowledgeSourceBinding;
  status: IAiAgentKnowledgeSourceBindingDocument['status'];
  configHash?: string;
  runId?: string;
}) =>
  models.AiAgentKnowledgeSourceBindings.updateOne(
    {
      agentId: binding.agentId,
      pluginName: binding.pluginName,
      moduleName: binding.moduleName,
      sourceKey: binding.sourceKey,
      sourceId: binding.sourceId,
    },
    {
      $set: {
        agentId: binding.agentId,
        pluginName: binding.pluginName,
        moduleName: binding.moduleName,
        sourceKey: binding.sourceKey,
        sourceId: binding.sourceId,
        materialized: !!binding.materialized,
        configHash,
        lastSyncedRunId: runId,
        status,
      },
      $unset: { indexError: 1 },
    },
    { upsert: true },
  );

const indexBoundKnowledgeDocument = async ({
  models,
  binding,
  document,
  configHash,
  runId,
}: {
  models: IModels;
  binding: TKnowledgeSourceBinding;
  document: TKnowledgeDocument;
  configHash?: string;
  runId?: string;
}) => {
  await upsertBinding({
    models,
    binding,
    status: 'indexing',
    configHash,
    runId,
  });

  try {
    const result = await indexKnowledgeDocument({ models, document });

    await models.AiAgentKnowledgeSourceBindings.updateOne(
      {
        agentId: binding.agentId,
        pluginName: binding.pluginName,
        moduleName: binding.moduleName,
        sourceKey: binding.sourceKey,
        sourceId: binding.sourceId,
      },
      {
        $set: {
          status: 'indexed',
          chunkCount: result.chunkCount,
          indexedAt: new Date(),
          materialized: !!binding.materialized,
          configHash,
          lastSyncedRunId: runId,
        },
        $unset: { indexError: 1 },
      },
    );

    return true;
  } catch (error) {
    await models.AiAgentKnowledgeSourceBindings.updateOne(
      {
        agentId: binding.agentId,
        pluginName: binding.pluginName,
        moduleName: binding.moduleName,
        sourceKey: binding.sourceKey,
        sourceId: binding.sourceId,
      },
      {
        $set: {
          status: 'failed',
          indexError:
            error instanceof Error ? error.message : 'Knowledge indexing failed.',
        },
      },
    );

    return false;
  }
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
    materialized: { $ne: true },
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
      const bindings = await models.AiAgentKnowledgeSourceBindings.find({
        ...bindingSelector,
        sourceId,
      }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();

      await Promise.all(
        bindings.map((binding) =>
          indexBoundKnowledgeDocument({
            models,
            binding,
            document,
          }),
        ),
      );

      continue;
    }

    await models.KnowledgeChunks.deleteMany({
      sourceType: getKnowledgeSourceType(source),
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

const upsertDirectBindings = async ({
  models,
  bindings,
}: {
  models: IModels;
  bindings: TKnowledgeSourceBinding[];
}) => {
  if (!bindings.length) {
    return;
  }

  await models.AiAgentKnowledgeSourceBindings.bulkWrite(
    bindings.map((binding) => ({
      updateOne: {
        filter: {
          agentId: binding.agentId,
          pluginName: binding.pluginName,
          moduleName: binding.moduleName,
          sourceKey: binding.sourceKey,
          sourceId: binding.sourceId,
        },
        update: {
          $set: {
            agentId: binding.agentId,
            pluginName: binding.pluginName,
            moduleName: binding.moduleName,
            sourceKey: binding.sourceKey,
            sourceId: binding.sourceId,
            materialized: false,
          },
          $setOnInsert: { status: 'queued' },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const cleanupRemovedBindings = async ({
  models,
  previousBindings,
  nextDirectBindingKeys,
  selectedSourceKeys,
}: {
  models: IModels;
  previousBindings: IAiAgentKnowledgeSourceBindingDocument[];
  nextDirectBindingKeys: Set<string>;
  selectedSourceKeys: Set<string>;
}) => {
  const removedBindings = previousBindings.filter((binding) => {
    const sourceKey = getSourceSelectionKey(binding);

    if (!selectedSourceKeys.has(sourceKey)) {
      return true;
    }

    return !binding.materialized && !nextDirectBindingKeys.has(getBindingKey(binding));
  });
  const removedChunks = await Promise.all(
    removedBindings.map((binding) =>
      removeBindingAndCleanup({ models, binding }),
    ),
  );

  return removedChunks.filter(Boolean).length;
};

const createScopeIndexRun = async ({
  models,
  subdomain,
  agentId,
  source,
}: {
  models: IModels;
  subdomain: string;
  agentId: string;
  source: TAiAgentKnowledgeSource;
}) => {
  const identity = getKnowledgeSourceIdentity(source);
  const config = buildMaterializedSourceConfig(source);
  const configHash = hashKnowledgeSourceConfig({
    sourceIds: [],
    config,
  });
  const run = await models.AiAgentKnowledgeIndexRuns.create({
    agentId,
    ...identity,
    status: 'queued',
    config,
    configHash,
  });

  try {
    const job = await sendWorkerQueue('automations', 'aiAgent').add(
      'syncAiKnowledgeSourceScope',
      {
        subdomain,
        data: { runId: run._id },
      },
      {
        attempts: 1,
        jobId: `knowledge-source-scope:${agentId}:${identity.pluginName}:${identity.moduleName}:${identity.sourceKey}:${configHash}:${run._id}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    await models.AiAgentKnowledgeIndexRuns.updateOne(
      { _id: run._id },
      { $set: { jobId: job.id } },
    );
  } catch (error) {
    await models.AiAgentKnowledgeIndexRuns.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Failed to schedule knowledge indexing.',
          completedAt: new Date(),
        },
      },
    );
  }

  return run._id;
};

const cleanupEmptyMaterializedSources = async ({
  models,
  agentId,
  sources,
}: {
  models: IModels;
  agentId: string;
  sources: TAiAgentKnowledgeSource[];
}) => {
  const emptyProductSources = sources.filter(
    (source) => isProductKnowledgeSource(source) && !hasProductScopeSelection(source),
  );
  const removedCounts = await Promise.all(
    emptyProductSources.map(async (source) => {
      const identity = getKnowledgeSourceIdentity(source);
      const bindings = await models.AiAgentKnowledgeSourceBindings.find({
        agentId,
        ...identity,
        materialized: true,
      }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
      const removed = await Promise.all(
        bindings.map((binding) =>
          removeBindingAndCleanup({ models, binding }),
        ),
      );

      return removed.filter(Boolean).length;
    }),
  );

  return removedCounts.reduce((sum, count) => sum + count, 0);
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
  const nextDirectBindings = toDirectBindings({ agentId, sources });
  const nextDirectBindingKeys = new Set(nextDirectBindings.map(getBindingKey));
  const selectedSourceKeys = new Set(
    sources.map((source) =>
      getSourceSelectionKey(getKnowledgeSourceIdentity(source)),
    ),
  );

  const [removedSourceCount, removedEmptyScopeCount] = await Promise.all([
    cleanupRemovedBindings({
      models,
      previousBindings,
      nextDirectBindingKeys,
      selectedSourceKeys,
    }),
    cleanupEmptyMaterializedSources({ models, agentId, sources }),
  ]);

  await upsertDirectBindings({ models, bindings: nextDirectBindings });

  const directGroups = groupBindings(nextDirectBindings);
  const indexedDocumentCounts = await Promise.all(
    directGroups.map((source) =>
      refreshKnowledgeSourceGroup({ models, subdomain, source }),
    ),
  );
  const scopedSources = sources.filter(isMaterializedKnowledgeSource);
  const scopeRunIds = await Promise.all(
    scopedSources.map((source) =>
      createScopeIndexRun({ models, subdomain, agentId, source }),
    ),
  );

  return {
    bindingCount: nextDirectBindings.length,
    indexedDocumentCount: indexedDocumentCounts.reduce(
      (sum, count) => sum + count,
      0,
    ),
    removedSourceCount: removedSourceCount + removedEmptyScopeCount,
    scopeRunCount: scopeRunIds.length,
  };
};

const removeStaleMaterializedBindings = async ({
  models,
  run,
}: {
  models: IModels;
  run: IAiAgentKnowledgeIndexRunDocument;
}) => {
  const staleBindings = await models.AiAgentKnowledgeSourceBindings.find({
    agentId: run.agentId,
    pluginName: run.pluginName,
    moduleName: run.moduleName,
    sourceKey: run.sourceKey,
    materialized: true,
    $or: [
      { configHash: { $ne: run.configHash } },
      { lastSyncedRunId: { $ne: run._id } },
    ],
  }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
  const removed = await Promise.all(
    staleBindings.map((binding) =>
      removeBindingAndCleanup({ models, binding }),
    ),
  );

  return removed.filter(Boolean).length;
};

export const syncAiKnowledgeSourceScope = async ({
  models,
  subdomain,
  runId,
}: {
  models: IModels;
  subdomain: string;
  runId: string;
}) => {
  const run = await models.AiAgentKnowledgeIndexRuns.findById(runId);

  if (!run) {
    throw new Error(`AI knowledge index run not found: ${runId}`);
  }

  const source: TKnowledgeSourceGroup = {
    pluginName: run.pluginName,
    moduleName: run.moduleName,
    sourceKey: run.sourceKey,
    sourceIds: [],
    config: run.config,
  };
  let cursor = run.lastCursor;
  let processedCount = run.processedCount || 0;
  let indexedCount = run.indexedCount || 0;
  let failedCount = run.failedCount || 0;
  let totalCount = run.totalCount || 0;

  await models.AiAgentKnowledgeIndexRuns.updateOne(
    { _id: run._id },
    {
      $set: {
        status: 'indexing',
        startedAt: run.startedAt || new Date(),
      },
      $unset: { errorMessage: 1 },
    },
  );

  try {
    while (true) {
      const activeRun = await models.AiAgentKnowledgeIndexRuns.findById(
        run._id,
      ).lean<IAiAgentKnowledgeIndexRunDocument | null>();

      if (activeRun?.status === 'cancelled') {
        return {
          status: 'cancelled' as const,
          processedCount,
          indexedCount,
          failedCount,
        };
      }

      const batch = await loadKnowledgeDocumentBatch({
        subdomain,
        source,
        cursor,
        limit: SCOPE_BATCH_LIMIT,
        skipTotalCount: totalCount > 0,
      });

      totalCount = totalCount || batch.totalCount;

      for (const document of batch.documents) {
        processedCount += 1;

        const ok = await indexBoundKnowledgeDocument({
          models,
          binding: {
            agentId: run.agentId,
            pluginName: run.pluginName,
            moduleName: run.moduleName,
            sourceKey: run.sourceKey,
            sourceId: document.source.id,
            materialized: true,
          },
          document,
          configHash: run.configHash,
          runId: run._id,
        });

        if (ok) {
          indexedCount += 1;
        } else {
          failedCount += 1;
        }
      }

      if (batch.hasMore && !batch.nextCursor) {
        throw new Error('Knowledge source batch returned hasMore without cursor.');
      }

      cursor = batch.nextCursor;

      await models.AiAgentKnowledgeIndexRuns.updateOne(
        { _id: run._id },
        {
          $set: {
            totalCount,
            processedCount,
            indexedCount,
            failedCount,
            lastCursor: cursor,
          },
        },
      );

      if (!batch.hasMore) {
        break;
      }
    }

    const removedCount = await removeStaleMaterializedBindings({
      models,
      run,
    });

    await models.AiAgentKnowledgeIndexRuns.updateOne(
      { _id: run._id },
      {
        $set: {
          status: failedCount ? 'failed' : 'indexed',
          totalCount,
          processedCount,
          indexedCount,
          failedCount,
          removedCount,
          completedAt: new Date(),
        },
      },
    );

    return {
      status: failedCount ? ('failed' as const) : ('indexed' as const),
      totalCount,
      processedCount,
      indexedCount,
      failedCount,
      removedCount,
    };
  } catch (error) {
    await models.AiAgentKnowledgeIndexRuns.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'failed',
          totalCount,
          processedCount,
          indexedCount,
          failedCount,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Knowledge source sync failed.',
          completedAt: new Date(),
        },
      },
    );

    throw error;
  }
};

const getAgentSourceTargetsForRefresh = async ({
  models,
  source,
}: {
  models: IModels;
  source: TAiKnowledgeSourceReference;
}) => {
  const agents = await models.AiAgents.find(
    {
      'context.knowledgeSources': {
        $elemMatch: {
          pluginName: source.pluginName,
          moduleName: source.moduleName,
          key: source.key,
        },
      },
    },
    {
      _id: 1,
      'context.knowledgeSources': 1,
    },
  ).lean<
    Array<{
      _id: string;
      context?: { knowledgeSources?: TAiAgentKnowledgeSource[] };
    }>
  >();
  const targets: TScopedSourceTarget[] = [];

  for (const agent of agents) {
    for (const selection of agent.context?.knowledgeSources || []) {
      if (
        !sourceMatches({
          source: selection,
          pluginName: source.pluginName,
          moduleName: source.moduleName,
          sourceKey: source.key,
        })
      ) {
        continue;
      }

      if (isProductKnowledgeSource(selection)) {
        if (hasProductScopeSelection(selection)) {
          targets.push({ agentId: agent._id, source: selection });
        }

        continue;
      }

      if (selection.sourceIds.includes(source.sourceId)) {
        targets.push({ agentId: agent._id, source: selection });
      }
    }
  }

  return targets;
};

const refreshMaterializedProductSource = async ({
  models,
  subdomain,
  target,
  sourceId,
}: {
  models: IModels;
  subdomain: string;
  target: TScopedSourceTarget;
  sourceId: string;
}) => {
  const identity = getKnowledgeSourceIdentity(target.source);
  const config = buildMaterializedSourceConfig(target.source);
  const configHash = hashKnowledgeSourceConfig({
    sourceIds: [],
    config,
  });
  const batch = await loadKnowledgeDocumentBatch({
    subdomain,
    source: {
      ...identity,
      sourceIds: [],
      config,
    },
    candidateSourceIds: [sourceId],
    limit: 1,
  });
  const document = batch.documents[0];
  const binding: TKnowledgeSourceBinding = {
    agentId: target.agentId,
    ...identity,
    sourceId,
    materialized: true,
  };

  if (!document) {
    const existingBinding = await models.AiAgentKnowledgeSourceBindings.findOne({
      agentId: target.agentId,
      ...identity,
      sourceId,
      materialized: true,
    }).lean<IAiAgentKnowledgeSourceBindingDocument | null>();

    if (!existingBinding) {
      return false;
    }

    await removeBindingAndCleanup({ models, binding: existingBinding });
    return false;
  }

  return indexBoundKnowledgeDocument({
    models,
    binding,
    document,
    configHash,
  });
};

const cleanupMaterializedBindingsWithoutTargets = async ({
  models,
  source,
  targetKeys,
}: {
  models: IModels;
  source: TAiKnowledgeSourceReference;
  targetKeys: Set<string>;
}) => {
  const bindings = await models.AiAgentKnowledgeSourceBindings.find({
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    sourceKey: source.key,
    sourceId: source.sourceId,
    materialized: true,
  }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
  const staleBindings = bindings.filter(
    (binding) => !targetKeys.has(getBindingKey(binding)),
  );
  const removed = await Promise.all(
    staleBindings.map((binding) =>
      removeBindingAndCleanup({ models, binding }),
    ),
  );

  return removed.filter(Boolean).length;
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
  const directBindings = await models.AiAgentKnowledgeSourceBindings.find({
    pluginName: source.pluginName,
    moduleName: source.moduleName,
    sourceKey: source.key,
    sourceId: source.sourceId,
    materialized: { $ne: true },
  }).lean<IAiAgentKnowledgeSourceBindingDocument[]>();
  const directIndexedDocumentCount = directBindings.length
    ? await refreshKnowledgeSourceGroup({
        models,
        subdomain,
        source: {
          pluginName: source.pluginName,
          moduleName: source.moduleName,
          sourceKey: source.key,
          sourceIds: [source.sourceId],
        },
      })
    : 0;
  const scopedTargets = await getAgentSourceTargetsForRefresh({
    models,
    source,
  });
  const materializedResults = await Promise.all(
    scopedTargets
      .filter((target) => isProductKnowledgeSource(target.source))
      .map((target) =>
        refreshMaterializedProductSource({
          models,
          subdomain,
          target,
          sourceId: source.sourceId,
        }),
      ),
  );
  const targetKeys = new Set(
    scopedTargets.map((target) =>
      getBindingKey({
        agentId: target.agentId,
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        sourceKey: source.key,
        sourceId: source.sourceId,
        materialized: true,
      }),
    ),
  );
  const removedMaterializedCount =
    await cleanupMaterializedBindingsWithoutTargets({
      models,
      source,
      targetKeys,
    });
  const indexedDocumentCount =
    directIndexedDocumentCount + materializedResults.filter(Boolean).length;

  if (!indexedDocumentCount && !removedMaterializedCount) {
    await models.KnowledgeChunks.deleteMany({
      sourceType: getKnowledgeSourceType({
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        sourceKey: source.key,
      }),
      sourceId: source.sourceId,
    });

    return { indexedDocumentCount: 0, status: 'unbound' as const };
  }

  return {
    indexedDocumentCount,
    removedMaterializedCount,
    status: 'refreshed' as const,
  };
};

const mapRunStatusToBindingStatus = (
  status: IAiAgentKnowledgeIndexRunDocument['status'],
): IAiAgentKnowledgeSourceBindingDocument['status'] => {
  if (status === 'cancelled') {
    return 'skipped';
  }

  if (status === 'indexed') {
    return 'indexed';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return status;
};

export const getAiAgentKnowledgeSourceStatuses = async ({
  models,
  agentId,
}: {
  models: IModels;
  agentId: string;
}) => {
  const [bindings, runs] = await Promise.all([
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
        materialized: 1,
        configHash: 1,
      },
    ).lean<IAiAgentKnowledgeSourceBindingDocument[]>(),
    models.AiAgentKnowledgeIndexRuns.find(
      { agentId },
      {
        pluginName: 1,
        moduleName: 1,
        sourceKey: 1,
        status: 1,
        totalCount: 1,
        processedCount: 1,
        indexedCount: 1,
        failedCount: 1,
        removedCount: 1,
        errorMessage: 1,
        completedAt: 1,
        createdAt: 1,
      },
    )
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<IAiAgentKnowledgeIndexRunDocument[]>(),
  ]);

  return [
    ...bindings,
    ...runs.map((run) => ({
      pluginName: run.pluginName,
      moduleName: run.moduleName,
      sourceKey: run.sourceKey,
      sourceId: `__scope_run__:${run._id}`,
      status: mapRunStatusToBindingStatus(run.status),
      chunkCount: run.indexedCount,
      indexError: run.errorMessage,
      indexedAt: run.completedAt,
      runId: run._id,
      totalCount: run.totalCount,
      processedCount: run.processedCount,
      indexedCount: run.indexedCount,
      failedCount: run.failedCount,
      removedCount: run.removedCount,
    })),
  ];
};
