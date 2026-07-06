import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TImportHandlers,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processPosItemRows } from './processPosItemRows';
import { POS_ITEM_IMPORT_HEADERS } from './utils';

const posImportMap = {
  posItems: {
    headers: POS_ITEM_IMPORT_HEADERS,
    processRows: (
      models: IModels,
      subdomain: string,
      rows: any[],
      userId: string,
    ) => processPosItemRows(models, subdomain, rows, userId),
  },
};

const getPayload = (args: any) => args?.data || args;
type GetImportHeadersArgs = Parameters<TImportHandlers['getImportHeaders']>[0];
type InsertImportRowsArgs = Parameters<TImportHandlers['insertImportRows']>[0];

const getCollectionConfig = (collectionName?: string) => {
  const config = posImportMap[collectionName as keyof typeof posImportMap];

  if (!config) {
    throw new Error(`POS import handler not found for "${collectionName}"`);
  }

  return config;
};

export const posImportHandlers: TImportHandlers = {
  getImportHeaders: async (
    args: GetImportHeadersArgs,
  ): Promise<TGetImportHeadersOutput> => {
    return getCollectionConfig(getPayload(args)?.collectionName).headers;
  },

  insertImportRows: async (args: InsertImportRowsArgs, ctx) => {
    const { collectionName, rows, userId } = getPayload(args);
    const { models, subdomain } = ctx as TCoreModuleProducerContext<IModels>;

    if (!userId) {
      throw new Error('Import userId is required');
    }

    if (!models) {
      throw new Error('POS import models are not available');
    }

    if (!Array.isArray(rows)) {
      throw new Error('Import rows must be an array');
    }

    return getCollectionConfig(collectionName).processRows(
      models,
      subdomain,
      rows,
      userId,
    );
  },
};
