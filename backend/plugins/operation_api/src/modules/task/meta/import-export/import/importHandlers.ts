import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { processTaskRows } from './processTaskRows';
import { IModels } from '~/connectionResolvers';
import { ITaskImportRow } from '../../../@types/task';

const taskImportMap = {
  tasks: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status' },
      { label: 'Team', key: 'team' },
      { label: 'Priority', key: 'priority' },
      { label: 'Assignee', key: 'assignee' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Target Date', key: 'targetDate' },
      { label: 'Estimate Point', key: 'estimatePoint' },
      { label: 'Project', key: 'project' },
      { label: 'Cycle', key: 'cycle' },
      { label: 'Milestone', key: 'milestone' },
      { label: 'Labels', key: 'labels' },
      { label: 'Tags', key: 'tags' },
    ],
    processRows: (
      models: IModels,
      rows: ITaskImportRow[],
      userId: string,
      subdomain: string,
    ) => processTaskRows(models, rows, userId, subdomain),
  },
};

export const taskImportHandlers = {
  getImportHeaders: (
    { collectionName }: { collectionName: string },
  ): Promise<TGetImportHeadersOutput> => {
    const handler =
      taskImportMap[collectionName as keyof typeof taskImportMap];
    if (!handler) {
      throw new Error(`Import headers handler not found for ${collectionName}`);
    }
    return Promise.resolve(handler.headers);
  },
  insertImportRows: async (
    { collectionName, rows, userId }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler =
      taskImportMap[collectionName as keyof typeof taskImportMap];
    if (!handler) {
      throw new Error(`Import handler not found for ${collectionName}`);
    }
    if (!models) {
      throw new Error('Models not available in context');
    }
    if (!subdomain) {
      throw new Error('Subdomain not available in context');
    }
    return await handler.processRows(models, rows, userId, subdomain);
  },
};
