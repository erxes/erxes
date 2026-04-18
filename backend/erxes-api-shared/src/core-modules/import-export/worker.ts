import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  createMQWorkerWithListeners,
  createTRPCContext,
  getEnv,
  initializePluginConfig,
  redis,
} from '../../utils';
import { TExportHandlers, ImportExportConfigs, TImportHandlers } from './types';
import { createCoreImportClient } from './utils/createCoreImportClient';
import { createImportBatchProcessor } from './utils/importBatchProcess';
import { createExportBatchProcessor } from './utils/exportBatchProcess';

const IMPORT_QUEUE = 'import-processor';
const EXPORT_QUEUE = 'export-processor';

const startedWorkers = new Set<string>();

const parsePositiveInteger = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getImportExportWorkerOptions = (kind: 'import' | 'export') => {
  const upperKind = kind.toUpperCase();
  const concurrency = parsePositiveInteger(
    getEnv({
      name: `IMPORT_EXPORT_${upperKind}_CONCURRENCY`,
      defaultValue: '1',
    }),
    1,
  );

  const limiterMax = parsePositiveInteger(
    getEnv({
      name: `IMPORT_EXPORT_${upperKind}_LIMITER_MAX`,
      defaultValue: '0',
    }),
    0,
  );

  const limiterDuration = parsePositiveInteger(
    getEnv({
      name: `IMPORT_EXPORT_${upperKind}_LIMITER_DURATION_MS`,
      defaultValue: '0',
    }),
    0,
  );

  return {
    concurrency,
    ...(limiterMax > 0 && limiterDuration > 0
      ? {
        limiter: {
          max: limiterMax,
          duration: limiterDuration,
        },
      }
      : {}),
  };
};

const generateImportExportRouter = (
  { getImportHeaders, batchSkipRow }: TImportHandlers | undefined = {} as TImportHandlers,
  { getExportHeaders }: TExportHandlers | undefined = {} as TExportHandlers,
) => {
  const routerConfig: Partial<
    Record<'getImportHeaders' | 'getExportHeaders' | 'batchSkipRow', AnyProcedure>
  > = {};
  const trpcRouter = initTRPC
    .context<{ subdomain: string; processId: string }>()
    .create();
  if (getImportHeaders) {
    routerConfig.getImportHeaders = trpcRouter.procedure
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
        return await getImportHeaders(input, ctx);
      });
  }

  if (getExportHeaders) {
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
        return await getExportHeaders(input, ctx);
      });
  }

  if (batchSkipRow) {
    routerConfig.batchSkipRow = trpcRouter.procedure
      .input(
        z.object({
          subdomain: z.string(),
          data: z.object({
            moduleName: z.string(),
            collectionName: z.string(),
            rowData: z.object({})
          }),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await batchSkipRow(input, ctx);
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

  return trpcMiddleware;
};

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

  const { import: importConfig, export: exportConfig } = config || {};

  initializePluginConfig(pluginName, 'importExport', {
    import: {
      configured: !!importConfig,
      hasGetImportHeaders: !!importConfig?.getImportHeaders,
      hasInsertImportRows: !!importConfig?.insertImportRows,
      types: importConfig?.types || [],
      hasSkipBatch: !!importConfig?.batchSkipRow,
    },
    export: {
      configured: !!exportConfig,
      hasGetExportHeaders: !!exportConfig?.getExportHeaders,
      hasGetExportData: !!exportConfig?.getExportData,
      types: exportConfig?.types || [],
    },
  });

  const coreClient = createCoreImportClient();
  const trpcMiddleware = generateImportExportRouter(importConfig, exportConfig);

  if (exportConfig) {
    const exportWorkerOptions = getImportExportWorkerOptions('export');
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
      exportWorkerOptions,
    );
  }
  if (importConfig) {
    const importWorkerOptions = getImportExportWorkerOptions('import');
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
      importWorkerOptions,
    );
  }

  startedWorkers.add(pluginName);
  app.use('/importExport', trpcMiddleware);
};
