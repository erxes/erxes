import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { initializePluginConfig } from '../../utils';
import { createTRPCContext } from '../../utils/trpc';
import {
  ImportExportConfigs,
  IImportExportContext,
  TImportExportProducers,
} from './types';
import { InsertImportRowsInput, InsertImportRowsInputData } from './zodSchemas';
import { z } from 'zod';

export const initImportExportProducers = async (
  app: Express,
  pluginName: string,
  config: ImportExportConfigs,
) => {
  await initializePluginConfig(pluginName, 'importExport', config);
  const t = initTRPC.context<IImportExportContext>().create();

  const { insertImportRows, getImportHeaders } = config || {};

  const importExportProcedures: Partial<
    Record<TImportExportProducers, AnyProcedure>
  > = {};

  if (insertImportRows) {
    importExportProcedures[TImportExportProducers.INSERT_IMPORT_ROWS] =
      t.procedure
        .input(InsertImportRowsInputData)
        .mutation(async ({ ctx, input }) => {
          return await insertImportRows(input, ctx).catch((error) => {
            console.error(error);
            return {
              successRows: [],
              errorRows: input.data.rows.map((row: any) => ({
                ...row,
                error: error.message,
              })),
            };
          });
        });
  }

  if (getImportHeaders) {
    importExportProcedures[TImportExportProducers.GET_IMPORT_HEADERS] =
      t.procedure
        .input(
          z.object({
            subdomain: z.string(),
            data: z.object({
              moduleName: z.string(),
              collectionName: z.string(),
            }),
          }),
        )
        .query(async ({ ctx, input }) => getImportHeaders(input, ctx));
  }

  const importExportRouter = t.router(importExportProcedures);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: importExportRouter,
    createContext: createTRPCContext<IImportExportContext>(
      async (_subdomain, context) => {
        const processId = nanoid(12);

        context.processId = processId;

        return context;
      },
    ),
  });

  app.use('/importExport', trpcMiddleware);
};
