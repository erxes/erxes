import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { initializePluginConfig } from '../../utils/service-discovery';
import { createTRPCContext } from '../../utils/trpc';
import { TApprovalChangeProducers, TApprovalConfig } from './types';
import { approvalChangeApplyInputSchema } from './zodSchemas';
import {
  localApprovalChangeType,
  normalizeApprovalConfig,
} from './approvalChangeTypes';

/**
 * Puts a plugin's approved-change work on the wire: the change types it owns
 * are declared to service discovery, and approval reaches the applier through
 * this endpoint instead of anything registered inside core's own process.
 */
export const initApproval = async (
  app: Express,
  pluginName: string,
  config: TApprovalConfig,
) => {
  await initializePluginConfig(
    pluginName,
    'approval',
    normalizeApprovalConfig(pluginName, config),
  );

  const t = initTRPC.context<any>().create();
  const procedures: Record<string, AnyProcedure> = {
    [TApprovalChangeProducers.APPLY]: t.procedure
      .input(approvalChangeApplyInputSchema)
      .mutation(async ({ input }) => {
        const { subdomain, data } = input;
        const applier =
          config.appliers[localApprovalChangeType(pluginName, data.changeType)];

        if (!applier) {
          throw new Error(
            `${pluginName} does not apply "${data.changeType}"`,
          );
        }

        const models = await config.generateModels(subdomain);

        await applier({ ...data, models, subdomain });

        return { applied: true };
      }),
  };

  app.use(
    '/approval',
    trpcExpress.createExpressMiddleware({
      router: t.router(procedures),
      createContext: createTRPCContext(async (_subdomain, context) => context),
    }),
  );
};
