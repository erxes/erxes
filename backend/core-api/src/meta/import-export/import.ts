import {
  createCoreModuleProducerHandler,
  startImportExportWorker,
  TImportExportProducers,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { contactImportHandlers } from '~/modules/contacts/meta/import-export/importHandlers';
import { Express } from 'express';
import { TGetImportHeadersInput } from 'erxes-api-shared/core-modules/import-export/zodSchemas';

const modules = {
  contact: contactImportHandlers,
};
export default async (app: Express) =>
  startImportExportWorker({
    pluginName: 'core',
    config: {
      import: {
        whenReady: () => {
          console.log('Import worker ready');
        },
        insertImportRows: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules,
          methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
          extractModuleName: (input: TInsertImportRowsInput) =>
            input.moduleName,
          generateModels,
        }),
        getImportHeaders: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules,
          methodName: TImportExportProducers.GET_IMPORT_HEADERS,
          extractModuleName: (input: TGetImportHeadersInput) =>
            input.moduleName,
          generateModels,
        }),
      },
    },
    app,
  });
