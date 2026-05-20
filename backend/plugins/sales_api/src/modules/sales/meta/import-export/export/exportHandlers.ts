import {
  GetExportDataArgs,
  IImportExportContext,
  TExportHandlers,
} from 'erxes-api-shared/core-modules';
import { getDealExportData } from './getDealExportData';
import { getDealExportHeaders } from './getDealExportHeaders';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];

const dealExportMap = {
  deals: {
    getExportHeaders: getDealExportHeaders,
    getExportData: getDealExportData,
  },
};

const getPayload = (args: any) => args?.data || args;

const getCollectionConfig = (collectionName?: string) => {
  const config = dealExportMap[collectionName as keyof typeof dealExportMap];

  if (!config) {
    throw new Error(`Export handler not found for "${collectionName}"`);
  }

  return config;
};

export const dealExportHandlers: TExportHandlers = {
  getExportHeaders: (args: ExportHeadersArgs, ctx: IImportExportContext) => {
    const payload = getPayload(args);
    return getCollectionConfig(payload?.collectionName).getExportHeaders(
      args,
      ctx,
    );
  },

  getExportData: (args: GetExportDataArgs, ctx: IImportExportContext) => {
    const payload = getPayload(args);
    return getCollectionConfig(payload?.collectionName).getExportData(
      args,
      ctx,
    );
  },
};
