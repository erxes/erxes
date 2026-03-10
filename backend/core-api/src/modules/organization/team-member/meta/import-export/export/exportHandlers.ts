import { TExportHandlers, IImportExportContext } from 'erxes-api-shared/core-modules';
import { getUserExportHeaders } from './getUserExportHeaders';
import { getUserExportData } from './getUserExportData';

const userExportMap: Record<string, any> = {
  user: {
    getExportHeaders: getUserExportHeaders,
    getExportData: getUserExportData,
  },
};

export const userExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const { collectionName } = data;
    const handler = userExportMap[collectionName]?.getExportHeaders;
    if (!handler) throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const { collectionName } = args;
    const handler = userExportMap[collectionName]?.getExportData;
    if (!handler) throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
