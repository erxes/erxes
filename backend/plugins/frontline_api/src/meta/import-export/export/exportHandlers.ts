import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getTicketExportHeaders } from './getTicketExportHeaders';
import { getTicketExportData } from './getTicketExportData';

const ticketExportMap = {
  ticket: {
    getExportHeaders: getTicketExportHeaders,
    getExportData: getTicketExportData,
  },
};

export const ticketExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
    const handler =
      ticketExportMap[collectionName as keyof typeof ticketExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.collectionName ?? args?.data?.collectionName;
    const handler =
      ticketExportMap[collectionName as keyof typeof ticketExportMap]
        ?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
