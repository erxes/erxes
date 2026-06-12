import {
  TExportHandlers,
  IImportExportContext,
  GetExportData,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTaskExportHeaders } from './getTaskExportHeaders';
import { getTaskExportData } from './getTaskExportData';
import { getProjectExportHeaders } from './getProjectExportHeaders';
import { getProjectExportData } from './getProjectExportData';

/**
 * Safely extracts the collectionName property from a raw request payload.
 *
 * @param input The raw request payload.
 * @returns The collection name as a string, or an empty string.
 */
function extractCollectionName(input: unknown): string {
  const raw = input as Record<string, unknown>;
  const dataObj = raw?.data as Record<string, unknown> | undefined;
  const rawCollectionName = raw?.collectionName ?? dataObj?.collectionName ?? '';
  return typeof rawCollectionName === 'string' ? rawCollectionName : '';
}

/**
 * Resolves the handler for a specific collection from a map, throwing if not found.
 *
 * @param map A lookup dictionary mapping collection names to handlers.
 * @param collectionName The name of the collection.
 * @param type The type of handler ('headers' | 'data').
 * @returns The resolved handler.
 */
function resolveHandler<T>(
  map: Record<string, T>,
  collectionName: string,
  type: 'headers' | 'data',
): T {
  const handler = map[collectionName];
  if (!handler) {
    throw new Error(`Export ${type} handler not found for ${collectionName}`);
  }
  return handler;
}

/**
 * Creates export handlers based on a mapping of collection names to header/data retrieval functions.
 *
 * @param exportMap Object mapping collection names to their respective export header/data handlers.
 * @returns An implementation of TExportHandlers.
 */
function createExportHandlers(
  exportMap: Record<
    string,
    {
      getExportHeaders: TExportHandlers['getExportHeaders'];
      getExportData: (
        args: GetExportData,
        ctx: IImportExportContext<IModels>,
      ) => Promise<Record<string, string>[]>;
    }
  >,
): TExportHandlers {
  return {
    getExportHeaders: async (data, ctx) => {
      const collectionName = extractCollectionName(data);
      const handler = resolveHandler(
        Object.fromEntries(
          Object.entries(exportMap).map(([k, v]) => [k, v.getExportHeaders]),
        ),
        collectionName,
        'headers',
      );
      return await handler(data, ctx);
    },
    getExportData: async (args, ctx) => {
      const collectionName = extractCollectionName(args);
      const handler = resolveHandler(
        Object.fromEntries(
          Object.entries(exportMap).map(([k, v]) => [k, v.getExportData]),
        ),
        collectionName,
        'data',
      );
      const rawArgs = args as unknown as Record<string, unknown>;
      const argsData = rawArgs?.data as Record<string, unknown> | undefined;
      const exportData = (argsData ?? rawArgs) as unknown as GetExportData;
      return await handler(exportData, ctx);
    },
  };
}

const taskExportMap = {
  task: {
    getExportHeaders: getTaskExportHeaders,
    getExportData: getTaskExportData,
  },
};

export const taskExportHandlers = createExportHandlers(taskExportMap);

const projectExportMap = {
  project: {
    getExportHeaders: getProjectExportHeaders,
    getExportData: getProjectExportData,
  },
};

export const projectExportHandlers = createExportHandlers(projectExportMap);
