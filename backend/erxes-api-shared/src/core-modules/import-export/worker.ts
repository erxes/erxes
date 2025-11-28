import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  createMQWorkerWithListeners,
  createTRPCContext,
  redis,
} from '../../utils';
import { ImportExportConfigs } from './types';
import { createCoreImportClient } from './utils/createCoreImportClient';
import { createImportBatchProcessor } from './utils/importBatchProcess';
import { createExportBatchProcessor } from './utils/exportBatchProcess';

const IMPORT_QUEUE = 'import-processor';
const EXPORT_QUEUE = 'export-processor';

const startedWorkers = new Set<string>();

const ImportConfigWorker = () => {};
export const startImportExportWorker = ({
  pluginName,
  config,
  app,
}: {
  pluginName: string;
  config: ImportExportConfigs;
  app: Express;
}) => {
  if (startedWorkers.has(pluginName)) {
    return;
  }

  const { import: importConfig, export: exportConfig } = config;

  if (!importConfig.insertImportRows || !importConfig.getImportHeaders) {
    console.warn(
      `[ImportExport] Skipping worker for "${pluginName}" because import handlers are missing`,
    );
    return;
  }

  const coreClient = createCoreImportClient();

  const trpcRouter = initTRPC
    .context<{ subdomain: string; processId: string }>()
    .create();

  const routerConfig: any = {
    getImportHeaders: trpcRouter.procedure
      .input(
        z.object({
          subdomain: z.string(),
          data: z.object({
            moduleName: z.string(),
            collectionName: z.string(),
          }),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await importConfig.getImportHeaders(input, ctx);
      }),
  };

  if (exportConfig?.getExportHeaders) {
    routerConfig.getExportHeaders = trpcRouter.procedure
      .input(
        z.object({
          subdomain: z.string(),
          data: z.object({
            moduleName: z.string(),
            collectionName: z.string(),
          }),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await exportConfig.getExportHeaders(input, ctx);
      });
  }

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: trpcRouter.router(routerConfig),
    createContext: createTRPCContext(async (_subdomain, context) => {
      const processId = nanoid(12);
      context.processId = processId;
      return context;
    }),
  });

  if (exportConfig?.getExportHeaders && exportConfig?.getExportData) {
    createMQWorkerWithListeners(
      pluginName,
      EXPORT_QUEUE,
      createExportBatchProcessor(exportConfig, coreClient, pluginName),
      redis,
      () => {
        console.log(
          `[ImportExport] Export worker ready for queue ${pluginName}-${EXPORT_QUEUE}`,
        );
        exportConfig.whenReady?.();
      },
    );
  }

  createMQWorkerWithListeners(
    pluginName,
    IMPORT_QUEUE,
    createImportBatchProcessor(importConfig, coreClient, pluginName),
    redis,
    () => {
      console.log(
        `[ImportExport] Worker ready for queue ${pluginName}-${IMPORT_QUEUE}`,
      );
      importConfig.whenReady?.();
    },
  );

  startedWorkers.add(pluginName);
  app.use('/importExport', trpcMiddleware);
};
