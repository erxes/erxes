import {
  GetExportData,
  TExportHandlers,
} from 'erxes-api-shared/core-modules';
import { getTransactionExportData } from './getTransactionExportData';
import { getTransactionExportHeaders } from './getTransactionExportHeaders';

export const transactionExportHandlers: TExportHandlers = {
  getExportHeaders: getTransactionExportHeaders,
  getExportData: async (args, ctx) => {
    const rawArgs = args as unknown as Record<string, unknown>;
    const exportData = (rawArgs.data ?? rawArgs) as GetExportData;

    return getTransactionExportData(exportData, ctx);
  },
};
