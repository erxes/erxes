import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getTaskExportHeaders } from './getTaskExportHeaders';
import { getTaskExportData } from './getTaskExportData';

const taskExportMap: Record<string, any> = {
  tasks: {
    getExportHeaders: getTaskExportHeaders,
    getExportData: getTaskExportData,
  },
};

export const taskExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const { collectionName } = data;
    const handler = taskExportMap[collectionName]?.getExportHeaders;
    if (!handler) {
      throw new Error(`Export headers handler not found for ${collectionName}`);
    }
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const { collectionName } = args;
    const handler = taskExportMap[collectionName]?.getExportData;
    if (!handler) {
      throw new Error(`Export handler not found for ${collectionName}`);
    }
    return handler(args, ctx);
  },
};
