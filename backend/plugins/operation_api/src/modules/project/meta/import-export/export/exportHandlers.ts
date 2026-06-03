import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getProjectExportHeaders } from './getProjectExportHeaders';
import { getProjectExportData } from './getProjectExportData';

const projectExportMap: Record<string, any> = {
  projects: {
    getExportHeaders: getProjectExportHeaders,
    getExportData: getProjectExportData,
  },
};

export const projectExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const { collectionName } = data;
    const handler = projectExportMap[collectionName]?.getExportHeaders;
    if (!handler) {
      throw new Error(`Export headers handler not found for ${collectionName}`);
    }
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const { collectionName } = args;
    const handler = projectExportMap[collectionName]?.getExportData;
    if (!handler) {
      throw new Error(`Export handler not found for ${collectionName}`);
    }
    return handler(args, ctx);
  },
};
