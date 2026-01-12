import {
  TExportHandlers,
  GetExportDataArgs,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getCustomerExportData } from './customers/getCustomerExportData';
import { getCustomerExportHeaders } from './customers/getCustomerExportHeaders';

const contactExportMap = {
  customer: {
    getExportHeaders: getCustomerExportHeaders,
    getExportData: getCustomerExportData,
  },
};

export const contactExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const { collectionName } = data;
    const handler = contactExportMap[collectionName]?.getExportHeaders;
    if (!handler) {
      throw new Error(`Export headers handler not found for ${collectionName}`);
    }
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const { collectionName } = args;
    const handler = contactExportMap[collectionName]?.getExportData;
    if (!handler) {
      throw new Error(`Export handler not found for ${collectionName}`);
    }
    return handler(args, ctx);
  },
};
