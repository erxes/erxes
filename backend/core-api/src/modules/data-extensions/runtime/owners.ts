import DataLoader from 'dataloader';
import { GraphQLError } from 'graphql';
import {
  DATA_EXTENSION_LIMITS,
  IDataExtensionRecord,
  IDataExtensionRecordType,
  ownerProofPayload,
  signDataExtensionsProof,
} from 'erxes-api-shared/core-modules';
import {
  createPluginTRPCContext,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { dataExtensionsTrpcRouter } from '~/modules/data-extensions/trpc/dataExtensions';
import { IRequestContext } from '~/modules/data-extensions/runtime/context';
import {
  recordOwnerCall,
  recordOwnerRetry,
} from '~/modules/data-extensions/runtime/metrics';
import { IOwnerResolvers } from '~/modules/data-extensions/runtime/schema/buildSchema';

const toGraphQLError = (error: unknown, owner: string, transport: boolean) =>
  transport
    ? new GraphQLError(`${owner} records are temporarily unavailable`, {
        extensions: { code: 'OWNER_UNAVAILABLE' },
      })
    : new GraphQLError(
        error instanceof Error ? error.message : 'Data Extensions owner failed',
        { extensions: { code: 'OWNER_ERROR' } },
      );

const OWNER_TIMEOUT_MS =
  Number(process.env.DATA_EXTENSIONS_OWNER_TIMEOUT_MS) || 10000;

/**
 * Errors the owner answered with (validation, permission) carry tRPC error
 * data; anything else is transport trouble (refused, reset, timeout) and is
 * safe to retry for reads.
 */
const isTransportError = (error: unknown) =>
  !(
    error &&
    typeof error === 'object' &&
    'data' in error &&
    (error as { data?: unknown }).data
  );

/** An answer the owner gave (validation, permission): never retried. */
class OwnerAnswerError extends Error {
  readonly data = { answeredBy: 'owner' };
}

type OwnerRecordsCaller = Record<
  OwnerAction,
  (input: Record<string, unknown>) => Promise<unknown>
>;

/**
 * Core owns its records in this process, so its owner router is called
 * directly: same signed input, same checks, no HTTP hop.
 */
const callCoreOwner = async <T>(
  context: IRequestContext,
  action: OwnerAction,
  input: Record<string, unknown>,
): Promise<T> => {
  const trpcContext = await createPluginTRPCContext(
    context.subdomain,
    { userId: context.user._id },
    async (subdomain, requestContext) => ({
      ...requestContext,
      models: await generateModels(subdomain),
    }),
  );
  const caller = dataExtensionsTrpcRouter.createCaller(
    trpcContext as Parameters<typeof dataExtensionsTrpcRouter.createCaller>[0],
  );
  // The router's procedures are typed per action; the owner contract is the
  // same for all of them.
  const records = caller.dataExtensions
    .records as unknown as OwnerRecordsCaller;

  try {
    return (await records[action](input)) as T;
  } catch (error) {
    throw new OwnerAnswerError(
      error instanceof Error ? error.message : 'Data Extensions owner failed',
    );
  }
};

const sendOnce = <T>(
  context: IRequestContext,
  descriptor: IDataExtensionRecordType,
  method: 'query' | 'mutation',
  action: OwnerAction,
  input: Record<string, unknown>,
): Promise<T> => {
  // Signed per attempt so a retry never reuses an expiring proof.
  const signedInput = {
    ...input,
    proof: signDataExtensionsProof(
      'owner',
      ownerProofPayload(context.subdomain, context.user._id, input),
    ),
  };

  if (descriptor.owner === 'core') {
    return callCoreOwner<T>(context, action, signedInput);
  }

  return sendTRPCMessage({
    subdomain: context.subdomain,
    pluginName: descriptor.owner,
    method,
    module: 'dataExtensions.records',
    action,
    input: signedInput,
    context: { userId: context.user._id },
    options: { signal: AbortSignal.timeout(OWNER_TIMEOUT_MS) },
    throwOnError: true,
  });
};

type OwnerAction = 'get' | 'patch' | 'findByRelation' | 'link' | 'search';

const callOwner = async <T>(
  context: IRequestContext,
  descriptor: IDataExtensionRecordType,
  method: 'query' | 'mutation',
  action: OwnerAction,
  input: Record<string, unknown>,
): Promise<T> => {
  const startedAt = performance.now();
  // Reads are idempotent and retried once; writes are never repeated.
  const attempts = method === 'query' ? 2 : 1;

  for (let attempt = 1; ; attempt++) {
    try {
      const result = await sendOnce<T>(
        context,
        descriptor,
        method,
        action,
        input,
      );

      recordOwnerCall(
        descriptor.owner,
        action,
        performance.now() - startedAt,
        false,
      );

      return result;
    } catch (error) {
      if (attempt < attempts && isTransportError(error)) {
        recordOwnerRetry();
        continue;
      }

      recordOwnerCall(
        descriptor.owner,
        action,
        performance.now() - startedAt,
        true,
      );
      throw toGraphQLError(error, descriptor.owner, isTransportError(error));
    }
  }
};

const getLoader = (
  context: IRequestContext,
  descriptor: IDataExtensionRecordType,
) => {
  let loader = context.loaders.get(descriptor.recordType);

  if (!loader) {
    loader = new DataLoader<string, IDataExtensionRecord | null>(
      async (ids) => {
        const records =
          (await callOwner<IDataExtensionRecord[] | undefined>(
            context,
            descriptor,
            'query',
            'get',
            { recordType: descriptor.recordType, ids: [...ids] },
          )) || [];
        const byId = new Map(records.map((record) => [record._id, record]));

        return ids.map((id) => byId.get(id) || null);
      },
      { maxBatchSize: DATA_EXTENSION_LIMITS.recordsPerLookup },
    );
    context.loaders.set(descriptor.recordType, loader);
  }

  return loader;
};

const getRelationLoader = (
  context: IRequestContext,
  descriptor: IDataExtensionRecordType,
  key: string,
  limit?: number,
) => {
  const loaderKey = `${descriptor.recordType}:${key}:${limit || ''}`;
  let loader = context.relationLoaders.get(loaderKey);

  if (!loader) {
    loader = new DataLoader<string, IDataExtensionRecord[]>(
      async (targetIds) => {
        const groups =
          (await callOwner<
            { targetId: string; records: IDataExtensionRecord[] }[] | undefined
          >(context, descriptor, 'query', 'findByRelation', {
            recordType: descriptor.recordType,
            key,
            targetIds: [...targetIds],
            ...(limit ? { limit } : {}),
          })) || [];
        const byTarget = new Map(
          groups.map((group) => [group.targetId, group.records]),
        );

        return targetIds.map((targetId) => byTarget.get(targetId) || []);
      },
      { maxBatchSize: DATA_EXTENSION_LIMITS.recordsPerLookup },
    );
    context.relationLoaders.set(loaderKey, loader);
  }

  return loader;
};

/** Reaches each record's owner over its tRPC contract with the caller id. */
export const ownerResolvers: IOwnerResolvers = {
  async load(context, descriptor, ids) {
    context.consumeRecords(ids.length);

    const results = await getLoader(context, descriptor).loadMany(ids);

    return results.map((result) => {
      if (result instanceof Error) {
        throw result;
      }

      return result;
    });
  },

  async patch(context, descriptor, id, values) {
    const record = await callOwner<IDataExtensionRecord | undefined>(
      context,
      descriptor,
      'mutation',
      'patch',
      { recordType: descriptor.recordType, _id: id, values },
    );

    getLoader(context, descriptor).clear(id);
    context.relationLoaders.clear();

    return record || null;
  },

  async search(context, descriptor, searchValue, limit) {
    const records =
      (await callOwner<IDataExtensionRecord[] | undefined>(
        context,
        descriptor,
        'query',
        'search',
        {
          recordType: descriptor.recordType,
          ...(searchValue ? { searchValue } : {}),
          ...(limit ? { limit } : {}),
        },
      )) || [];

    context.consumeRecords(records.length);

    const loader = getLoader(context, descriptor);

    records.forEach((record) => loader.prime(record._id, record));

    return records;
  },

  async link(context, descriptor, key, ids, targetId, action) {
    const result = await callOwner<{ ids: string[] } | undefined>(
      context,
      descriptor,
      'mutation',
      'link',
      { recordType: descriptor.recordType, key, ids, targetId, action },
    );
    const loader = getLoader(context, descriptor);

    ids.forEach((id) => loader.clear(id));
    context.relationLoaders.clear();

    return result?.ids || [];
  },

  async findByRelation(context, descriptor, key, targetId, limit) {
    const records = await getRelationLoader(
      context,
      descriptor,
      key,
      limit,
    ).load(targetId);

    context.consumeRecords(records.length);

    return records;
  },
};
