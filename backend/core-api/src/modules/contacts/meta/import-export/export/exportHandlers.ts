import {
  TExportHandlers,
  GetExportDataArgs,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getCustomerExportData } from './customers/getCustomerExportData';
import { getCustomerExportHeaders } from './customers/getCustomerExportHeaders';
import { getCompanyExportHeaders } from './companies/getCompanyExportHeaders';
import { getCompanyExportData } from './companies/getCompanyExportData';

const contactExportMap = {
  customer: {
    getExportHeaders: getCustomerExportHeaders,
    getExportData: getCustomerExportData,
  },
  company: {
    getExportHeaders: getCompanyExportHeaders,
    getExportData: getCompanyExportData,
  },
};


export const contactExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
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
