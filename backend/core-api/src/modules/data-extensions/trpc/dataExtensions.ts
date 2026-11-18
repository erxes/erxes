import { initTRPC, TRPCError } from '@trpc/server';
import {
  DATA_EXTENSIONS_OWNER_INPUTS,
  getCustomDataExtensionRecordTypes,
  getDataExtensionRecordModel,
  IDataExtensionOwnerContext,
  IDataExtensionStorageAdapter,
  runDataExtensionsOwnerCall,
} from 'erxes-api-shared/core-modules';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

type CoreDataExtensionsContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<CoreDataExtensionsContext>().create();

const OWNER = 'core';

const contactBaseFilter = { status: { $ne: 'deleted' } };

const joinName = (...parts: unknown[]) =>
  parts
    .filter((part): part is string => typeof part === 'string' && !!part)
    .join(' ');

/**
 * Custom objects of the current request's tenant (see
 * `withCustomRecordTypes`), each stored in its own collection.
 */
const customAdapters = (models: IModels) =>
  Object.fromEntries(
    getCustomDataExtensionRecordTypes().map(
      (descriptor): [string, IDataExtensionStorageAdapter] => [
        descriptor.recordType,
        {
          storage: descriptor.recordType,
          model: getDataExtensionRecordModel(
            models.DataExtensionFields.db,
            descriptor.recordType.slice(descriptor.recordType.indexOf(':') + 1),
          ),
          searchPaths: ['name'],
        },
      ],
    ),
  );

export const buildOwnerContext = (
  models: IModels,
): IDataExtensionOwnerContext => ({
  metadata: models,
  adapters: {
    ...customAdapters(models),
    'core:companies': {
      storage: 'core:companies',
      model: models.Companies,
      baseFilter: contactBaseFilter,
      searchPaths: ['primaryName', 'primaryEmail', 'primaryPhone', 'code'],
      computedPaths: ['primaryName'],
      computeNative: (doc) => ({
        contactType: 'company',
        displayName:
          joinName(doc.primaryName) ||
          joinName(doc.primaryEmail) ||
          joinName(doc.primaryPhone),
      }),
    },
    'core:customers': {
      storage: 'core:customers',
      model: models.Customers,
      baseFilter: contactBaseFilter,
      searchPaths: [
        'firstName',
        'lastName',
        'primaryEmail',
        'primaryPhone',
        'code',
      ],
      computedPaths: ['firstName', 'lastName'],
      computeNative: (doc) => ({
        contactType: 'customer',
        displayName:
          joinName(doc.firstName, doc.lastName) ||
          joinName(doc.primaryEmail) ||
          joinName(doc.primaryPhone),
      }),
    },
    'core:users': {
      storage: 'core:users',
      model: models.Users,
      searchPaths: ['details.fullName', 'username', 'email'],
    },
    'core:products': {
      storage: 'core:products',
      model: models.Products,
      baseFilter: { status: { $ne: 'deleted' } },
      searchPaths: ['name', 'code', 'shortName'],
    },
  },
});

/** A deactivated team member keeps read access history but cannot write. */
const assertActiveUser = (models: IModels) => async (userId: string) => {
  if (!(await models.Users.exists({ _id: userId, isActive: { $ne: false } }))) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

/**
 * Owner contract for Data Extensions on Core records. Only the runtime can
 * call it: every request carries a proof signed for this tenant, actor and
 * exact input, issued after the runtime checked the caller's permissions.
 */
export const dataExtensionsTrpcRouter = t.router({
  dataExtensions: t.router({
    records: t.router({
      get: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.get)
        .query(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'get',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
          }),
        ),
      findByRelation: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.findByRelation)
        .query(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'findByRelation',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
          }),
        ),
      search: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.search)
        .query(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'search',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
          }),
        ),
      patch: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.patch)
        .mutation(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'patch',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
            assertActor: assertActiveUser(ctx.models),
          }),
        ),
      purge: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.purge)
        .mutation(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'purge',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
            assertActor: assertActiveUser(ctx.models),
          }),
        ),
      link: t.procedure
        .input(DATA_EXTENSIONS_OWNER_INPUTS.link)
        .mutation(({ ctx, input }) =>
          runDataExtensionsOwnerCall({
            operation: 'link',
            owner: OWNER,
            subdomain: ctx.subdomain,
            userId: ctx.userId,
            input,
            context: buildOwnerContext(ctx.models),
            assertActor: assertActiveUser(ctx.models),
          }),
        ),
    }),
  }),
});
