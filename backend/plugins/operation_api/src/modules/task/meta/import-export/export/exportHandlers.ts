import {
  TExportHandlers,
  IImportExportContext,
  GetExportData,
} from 'erxes-api-shared/core-modules';
import { getTaskExportHeaders } from './getTaskExportHeaders';
import { getTaskExportData } from './getTaskExportData';

const taskExportMap = {
  tasks: {
    getExportHeaders: getTaskExportHeaders,
    getExportData: getTaskExportData,
  },
};

/** Type guard for export arguments containing a collectionName. */
const isExportArgs = (args: unknown): args is { collectionName: string } & Record<string, unknown> => {
  return typeof args === 'object' && args !== null && 'collectionName' in args;
};

export const taskExportHandlers: TExportHandlers = {
  getExportHeaders: async (args: unknown) => {
    if (!isExportArgs(args)) {
      throw new Error('Invalid export headers arguments');
    }
    const { collectionName } = args;
    const handler = taskExportMap[collectionName as keyof typeof taskExportMap]?.getExportHeaders;
    if (!handler) {
      throw new Error(`Export headers handler not found for ${collectionName}`);
    }
    return await handler();
  },
  getExportData: async (args: unknown, ctx: IImportExportContext) => {
    if (!isExportArgs(args)) {
      throw new Error('Invalid export data arguments');
    }
    const { collectionName } = args;
    const handler = taskExportMap[collectionName as keyof typeof taskExportMap]?.getExportData;
    if (!handler) {
      throw new Error(`Export handler not found for ${collectionName}`);
    }
    return await handler(args as GetExportData, ctx);
  },
};
