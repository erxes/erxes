import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { processTicketRows } from './processTicketRows';
import { IModels } from '~/connectionResolvers';
import { getTicketCustomPropertyHeaders } from '../utils';

const TICKET_SYSTEM_HEADERS = [
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
];

export const ticketImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    if (collectionName !== 'ticket')
      throw new Error(`Import headers handler not found for ${collectionName}`);

    const customHeaders = await getTicketCustomPropertyHeaders(subdomain);
    return [...TICKET_SYSTEM_HEADERS, ...customHeaders];
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { subdomain, models }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionName !== 'ticket')
      throw new Error(`Import handler not found for ${collectionName}`);
    return processTicketRows(subdomain, models, rows);
  },
};
