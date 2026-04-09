import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { processTicketRows } from './processTicketRows';
import { IModels } from '~/connectionResolvers';

const ticketImportMap = {
  ticket: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Type', key: 'type' },
      { label: 'Priority', key: 'priority' },
      { label: 'Status', key: 'statusType' },
      { label: 'State', key: 'state' },
      { label: 'Pipeline ID', key: 'pipelineId' },
      { label: 'Channel ID', key: 'channelId' },
      { label: 'Assignee ID', key: 'assigneeId' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Due Date', key: 'targetDate' },
      { label: 'Tags', key: 'tags' },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processTicketRows(models, rows),
  },
};

export const ticketImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler =
      ticketImportMap[collectionName as keyof typeof ticketImportMap];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler =
      ticketImportMap[collectionName as keyof typeof ticketImportMap];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(models, rows);
  },
};
