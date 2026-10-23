import { initTRPC } from '@trpc/server';
import {
  DATA_EXTENSIONS_OWNER_INPUTS,
  getDataExtensionModels,
  IDataExtensionOwnerContext,
  runDataExtensionsOwnerCall,
} from 'erxes-api-shared/core-modules';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

type OperationDataExtensionsContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<OperationDataExtensionsContext>().create();

const OWNER = 'operation';

const buildOwnerContext = (models: IModels): IDataExtensionOwnerContext => ({
  // Definitions are Core-owned metadata in the same tenant database.
  metadata: getDataExtensionModels(models.Task.db),
  adapters: {
    'operation:tasks': { storage: 'operation:tasks', model: models.Task },
    'operation:triage': { storage: 'operation:triage', model: models.Triage },
    'operation:projects': {
      storage: 'operation:projects',
      model: models.Project,
    },
    'operation:milestones': {
      storage: 'operation:milestones',
      model: models.Milestone,
    },
    'operation:teams': { storage: 'operation:teams', model: models.Team },
    'operation:cycles': { storage: 'operation:cycles', model: models.Cycle },
    'operation:statuses': {
      storage: 'operation:statuses',
      model: models.Status,
    },
    'operation:notes': {
      storage: 'operation:notes',
      model: models.Note,
      searchPaths: ['content'],
    },
  },
});

/**
 * Owner contract for Data Extensions on Operation records. Only the runtime
 * can call it (signed proof per request); ObjectId ids stay intact and
 * patches are validated at commit time.
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
          }),
        ),
    }),
  }),
});
