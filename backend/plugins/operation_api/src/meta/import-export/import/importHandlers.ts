import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTaskCustomPropertyHeaders } from '../utils';
import { processTaskRows } from './processTaskRows';

const TASK_SYSTEM_HEADERS = [
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description' },
  { label: 'Team', key: 'teamId' },
  { label: 'Status', key: 'status' },
  { label: 'Priority', key: 'priority' },
  { label: 'Assignee', key: 'assigneeId' },
  { label: 'Project', key: 'projectId' },
  { label: 'Cycle', key: 'cycleId' },
  { label: 'Milestone', key: 'milestoneId' },
  { label: 'Tags', key: 'tagIds' },
  { label: 'Estimate Point', key: 'estimatePoint' },
  { label: 'Start Date', key: 'startDate' },
  { label: 'Due Date', key: 'targetDate' },
];

export const taskImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    if (collectionName !== 'task') {
      throw new Error(
        `Import headers handler not found for ${collectionName}`,
      );
    }

    const customHeaders = await getTaskCustomPropertyHeaders(subdomain);
    return [...TASK_SYSTEM_HEADERS, ...customHeaders];
  },

  insertImportRows: async (
    { collectionName, rows, userId }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionName !== 'task') {
      throw new Error(`Import handler not found for ${collectionName}`);
    }

    if (!models) {
      throw new Error('Models not available in context');
    }

    return await processTaskRows(subdomain, models, rows, userId);
  },
};
