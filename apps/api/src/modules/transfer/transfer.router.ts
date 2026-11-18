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
import { assertSeesColumns, transferTypes } from '~/modules/transfer/pluginTransfer';
import { scoped } from '~/orpc';

export const transferRouter = {
  types: scoped.transfer.types.handler(() => transferTypes(db())),
  columns: scoped.transfer.columns.handler(async ({ input }) => {
    await assertSeesColumns(db(), input.recordType);

    return {
      data: (await transferColumns(db(), input.recordType)).map(
        ({ aliases, fieldType, ...column }) => column,
      ),
    };
  }),
  imports: scoped.transfer.imports.handler(({ input }) => listImports(db(), input)),
  import: scoped.transfer.import.handler(({ input }) => getImport(db(), input.id)),
  createImport: scoped.transfer.createImport.handler(({ input }) => createImport(db(), input)),
  updateImport: scoped.transfer.updateImport.handler(({ input: { id, ...changes } }) =>
    updateImport(db(), id, changes),
  ),
  checkImport: scoped.transfer.checkImport.handler(({ input }) => checkImport(db(), input.id)),
  startImport: scoped.transfer.startImport.handler(({ input }) => startImport(db(), input.id)),
  undoImport: scoped.transfer.undoImport.handler(({ input }) => undoImport(db(), input.id)),
  importRows: scoped.transfer.importRows.handler(({ input: { id, ...query } }) =>
    listImportRows(db(), id, query),
  ),
  exports: scoped.transfer.exports.handler(({ input }) => listExports(db(), input)),
  createExport: scoped.transfer.createExport.handler(({ input }) => createExport(db(), input)),
};
