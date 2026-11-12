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
  columns: authed.transfer.columns.handler(async ({ input, context }) => ({
    data: (await transferColumns(db(), context.actor.orgId, input.recordType)).map(
      ({ aliases, fieldType, ...column }) => column,
    ),
  })),
  imports: authed.transfer.imports.handler(({ context }) => listImports(db(), context.actor)),
  import: authed.transfer.import.handler(({ input, context }) =>
    getImport(db(), context.actor, input.id),
  ),
  createImport: authed.transfer.createImport.handler(({ input, context }) =>
    createImport(db(), context.actor, input),
  ),
  updateImport: authed.transfer.updateImport.handler(({ input: { id, ...changes }, context }) =>
    updateImport(db(), context.actor, id, changes),
  ),
  checkImport: authed.transfer.checkImport.handler(({ input, context }) =>
    checkImport(db(), context.actor, input.id),
  ),
  startImport: authed.transfer.startImport.handler(({ input, context }) =>
    startImport(db(), context.actor, input.id),
  ),
  undoImport: authed.transfer.undoImport.handler(({ input, context }) =>
    undoImport(db(), context.actor, input.id),
  ),
  importRows: authed.transfer.importRows.handler(({ input: { id, ...query }, context }) =>
    listImportRows(db(), context.actor, id, query),
  ),
  exports: authed.transfer.exports.handler(({ context }) => listExports(db(), context.actor)),
  createExport: authed.transfer.createExport.handler(({ input, context }) =>
    createExport(db(), context.actor, input),
  ),
};
