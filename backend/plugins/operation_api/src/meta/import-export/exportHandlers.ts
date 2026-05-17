import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getTaskExportHeaders } from '@/task/meta/import-export/export/getTaskExportHeaders';
import { getTaskExportData } from '@/task/meta/import-export/export/getTaskExportData';
import { getProjectExportHeaders } from '@/project/meta/import-export/export/getProjectExportHeaders';
import { getProjectExportData } from '@/project/meta/import-export/export/getProjectExportData';

const exportMap = {
  task: {
    getExportHeaders: getTaskExportHeaders,
    getExportData: getTaskExportData,
  },
  project: {
    getExportHeaders: getProjectExportHeaders,
    getExportData: getProjectExportData,
  },
};

export const operationExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
    const handler =
      exportMap[collectionName as keyof typeof exportMap]?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.collectionName ?? args?.data?.collectionName;
    const handler =
      exportMap[collectionName as keyof typeof exportMap]?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
