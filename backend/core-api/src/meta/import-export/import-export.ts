import { contactImportHandlers } from '@/contacts/meta/import-export/importHandlers';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
} from 'erxes-api-shared/core-modules';
import { TInsertImportRowsInput } from 'erxes-api-shared/core-modules/import-export';
import { initImportExportProducers } from 'erxes-api-shared/core-modules/import-export/setupImportExportProducers';
import { Express } from 'express';
import { generateModels } from '~/connectionResolvers';

const modules = {
  contact: contactImportHandlers,
};

export const initImportExportCoreProducers = (app: Express) =>
  initImportExportProducers(app, 'core', {
    insertImportRows: createCoreModuleProducerHandler({
      moduleName: 'importExport',
      modules,
      methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
      extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
      generateModels,
    }),
    getImportHeaders: createCoreModuleProducerHandler({
      moduleName: 'importExport',
      modules,
      methodName: TImportExportProducers.GET_IMPORT_HEADERS,
      extractModuleName: (input: {
        moduleName: string;
        collectionName: string;
      }) => input.moduleName,
      generateModels,
    }),
  });
