import {
  TExportHandlers,
  GetExportData,
} from 'erxes-api-shared/core-modules';
import { getTaskExportHeaders } from './getTaskExportHeaders';
import { getTaskExportData } from './getTaskExportData';
import { getProjectExportHeaders } from './getProjectExportHeaders';
import { getProjectExportData } from './getProjectExportData';

export const taskExportHandlers: TExportHandlers = {
  getExportHeaders: getTaskExportHeaders,
  getExportData: async (args, ctx) => {
    const rawArgs = args as unknown as Record<string, unknown>;
    const argsData = rawArgs?.data as Record<string, unknown> | undefined;
    const exportData = (argsData ?? rawArgs) as unknown as GetExportData;
    return await getTaskExportData(exportData, ctx);
  },
};

export const projectExportHandlers: TExportHandlers = {
  getExportHeaders: getProjectExportHeaders,
  getExportData: async (args, ctx) => {
    const rawArgs = args as unknown as Record<string, unknown>;
    const argsData = rawArgs?.data as Record<string, unknown> | undefined;
    const exportData = (argsData ?? rawArgs) as unknown as GetExportData;
    return await getProjectExportData(exportData, ctx);
  },
};
