import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { createTRPCContext } from '../../../utils/trpc';
import { initializePluginConfig as initializeServiceConfig } from '../../../utils/service-discovery';
import { fetchRecordReferenceTargets } from './fetchRecordReferenceTargets';
import { normalizeRecordReferenceConfig } from './normalizeRecordReferenceConfig';
import { resolveRecordReferencePath } from './resolveRecordReferencePath';
import { TRecordReferenceProducers, TRecordReferencesConfig } from './types';
import { RecordReferenceResolveInput } from './zodInputs';
import { isBlankReferenceValue } from './utils';

export const initRecordReferences = async (
  app: Express,
  pluginName: string,
  config: TRecordReferencesConfig,
) => {
  await initializeServiceConfig(
    pluginName,
    'references',
    normalizeRecordReferenceConfig(pluginName, config),
  );

  const t = initTRPC.context<any>().create();
  const procedures: Record<string, AnyProcedure> = {
    [TRecordReferenceProducers.RESOLVE]: t.procedure
      .input(RecordReferenceResolveInput)
      .mutation(async ({ input }) => {
        const { subdomain, data } = input;
        const { defaultValue, path, target, targetId, targetIds, type } = data;
        const models = await config.generateModels(subdomain);
        const targets = target
          ? [target]
          : await fetchRecordReferenceTargets({
              config,
              models,
              pluginName,
              subdomain,
              type,
              targetId,
              targetIds,
            });

        if (!targets.length) {
          return defaultValue;
        }

        const values = await Promise.all(
          targets.map((currentTarget) =>
            resolveRecordReferencePath({
              config,
              defaultValue,
              models,
              path,
              pluginName,
              subdomain,
              target: currentTarget,
              type,
            }),
          ),
        );

        const resolvedValues = values
          .flat()
          .filter((value) => !isBlankReferenceValue(value));

        if (targetIds?.length) {
          return resolvedValues;
        }

        return resolvedValues.length > 1
          ? resolvedValues
          : (resolvedValues[0] ?? defaultValue);
      }),
  };

  app.use(
    '/references',
    trpcExpress.createExpressMiddleware({
      router: t.router(procedures),
      createContext: createTRPCContext(async (_subdomain, context) => context),
    }),
  );
};
