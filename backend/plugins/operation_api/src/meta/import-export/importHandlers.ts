import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processTaskRows } from '@/task/meta/import-export/import/processTaskRows';
import { processProjectRows } from '@/project/meta/import-export/import/processProjectRows';

const importMap = {
  task: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Team ID', key: 'teamId' },
      { label: 'Status ID', key: 'status' },
      { label: 'Priority', key: 'priority' },
      { label: 'Estimate Point', key: 'estimatePoint' },
      { label: 'Project ID', key: 'projectId' },
      { label: 'Cycle ID', key: 'cycleId' },
      { label: 'Milestone ID', key: 'milestoneId' },
      { label: 'Assignee ID', key: 'assigneeId' },
      { label: 'Labels', key: 'labelIds' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Target Date', key: 'targetDate' },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processTaskRows(models, rows),
  },
  project: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Team IDs', key: 'teamIds' },
      { label: 'Member IDs', key: 'memberIds' },
      { label: 'Lead ID', key: 'leadId' },
      { label: 'Priority', key: 'priority' },
      { label: 'Status', key: 'status' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Target Date', key: 'targetDate' },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processProjectRows(models, rows),
  },
};

export const operationImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    _ctx: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = importMap[collectionName as keyof typeof importMap];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = importMap[collectionName as keyof typeof importMap];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(models, rows);
  },
};
