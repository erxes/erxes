import { db } from '@erxes/core-db';
import { transferColumns } from '~/modules/transfer/columns';
import { createExport, listExports } from '~/modules/transfer/exports.service';
import {
  checkImport,
  createImport,
  getImport,
  listImportRows,
  listImports,
  startImport,
  undoImport,
  updateImport,
} from '~/modules/transfer/imports.service';
import { authed } from '~/orpc';

export const transferRouter = {
  columns: authed.transfer.columns.handler(async ({ input }) => ({
    data: (await transferColumns(db(), input.recordType)).map(
      ({ aliases, fieldType, ...column }) => column,
    ),
  })),
  imports: authed.transfer.imports.handler(({ input }) => listImports(db(), input)),
  import: authed.transfer.import.handler(({ input }) => getImport(db(), input.id)),
  createImport: authed.transfer.createImport.handler(({ input, context }) =>
    createImport(db(), context.actor, input),
  ),
  updateImport: authed.transfer.updateImport.handler(({ input: { id, ...changes } }) =>
    updateImport(db(), id, changes),
  ),
  checkImport: authed.transfer.checkImport.handler(({ input }) => checkImport(db(), input.id)),
  startImport: authed.transfer.startImport.handler(({ input }) => startImport(db(), input.id)),
  undoImport: authed.transfer.undoImport.handler(({ input, context }) =>
    undoImport(db(), context.actor, input.id),
  ),
  importRows: authed.transfer.importRows.handler(({ input: { id, ...query } }) =>
    listImportRows(db(), id, query),
  ),
  exports: authed.transfer.exports.handler(({ input }) => listExports(db(), input)),
  createExport: authed.transfer.createExport.handler(({ input, context }) =>
    createExport(db(), context.actor, input),
  ),
};
