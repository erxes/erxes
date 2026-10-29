import {
  TExportHandlers,
  IImportExportContext,
  GetExportDataArgs,
} from 'erxes-api-shared/core-modules';
import { getPosItemsExportHeaders } from './getPosItemsExportHeaders';
import { getPosItemsExportData } from './getPosItemsExportData';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];

type TModuleArgs = {
  collectionName?: string;
  data?: { collectionName?: string };
};

/**
 * The module producer passes a module handler the request's `data` itself,
 * while `TExportHandlers` describes `{ subdomain, data }`, so read the
 * collection from either shape.
 */
const readCollectionName = (args: TModuleArgs) =>
  args.collectionName ?? args.data?.collectionName;

const posExportMap = {
  posItems: {
    getExportHeaders: getPosItemsExportHeaders,
    getExportData: getPosItemsExportData,
  },
};

export const posExportHandlers: TExportHandlers = {
  getExportHeaders: (
    args: ExportHeadersArgs | ExportHeadersArgs['data'],
    ctx: IImportExportContext,
  ) => {
    const collectionName = readCollectionName(args);
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(
        `Export headers handler not found for "${collectionName}" (type: ${typeof collectionName})`,
      );
    return handler(args, ctx);
  },
  getExportData: (
    args: GetExportDataArgs | GetExportDataArgs['data'],
    ctx: IImportExportContext,
  ) => {
    const collectionName = readCollectionName(args);
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]?.getExportData;
    if (!handler)
      throw new Error(
        `Export data handler not found for "${collectionName}" (type: ${typeof collectionName})`,
      );
    return handler(args, ctx);
  },
};
