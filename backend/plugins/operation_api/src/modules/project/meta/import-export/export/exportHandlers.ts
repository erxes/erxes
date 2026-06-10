import {
  TExportHandlers,
  IImportExportContext,
  GetExportData,
} from 'erxes-api-shared/core-modules';
import { getProjectExportHeaders } from './getProjectExportHeaders';
import { getProjectExportData } from './getProjectExportData';
import { IProjectFilter } from '../../../@types/project';

const projectExportMap = {
  projects: {
    getExportHeaders: getProjectExportHeaders,
    getExportData: getProjectExportData,
  },
};

/** Type guard for export arguments containing a collectionName. */
const isExportArgs = (args: unknown): args is { collectionName: string } & Record<string, unknown> => {
  return typeof args === 'object' && args !== null && 'collectionName' in args;
};

export const projectExportHandlers: TExportHandlers = {
  getExportHeaders: async (args: unknown) => {
    if (!isExportArgs(args)) {
      throw new Error('Invalid export headers arguments');
    }
    const { collectionName } = args;
    const handler = projectExportMap[collectionName as keyof typeof projectExportMap]?.getExportHeaders;
    if (!handler) {
      throw new Error(`Export headers handler not found for ${collectionName}`);
    }
    return await handler();
  },
  getExportData: async (args: unknown, ctx: IImportExportContext) => {
    if (!isExportArgs(args)) {
      throw new Error('Invalid export data arguments');
    }
    const { collectionName } = args;
    const handler = projectExportMap[collectionName as keyof typeof projectExportMap]?.getExportData;
    if (!handler) {
      throw new Error(`Export handler not found for ${collectionName}`);
    }
    return await handler(args as GetExportData & { filters?: IProjectFilter }, ctx);
  },
};
