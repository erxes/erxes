import {
  createCoreModuleProducerHandler,
  startImportExportWorker,
  TImportExportProducers,
  TInsertImportRowsInput,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TGetImportHeadersInput,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { contactImportHandlers } from '~/modules/contacts/meta/import-export/import/importHandlers';
import { Express } from 'express';
import { contactExportHandlers } from '~/modules/contacts/meta/import-export/export/exportHandlers';
import { productImportHandlers } from '~/modules/products/meta/import-export/import/importHandlers';
import { productExportHandlers } from '~/modules/products/meta/import-export/export/exportHandlers';
import { userImportHandlers } from '~/modules/organization/team-member/meta/import-export/import/importHandlers';
import { userExportHandlers } from '~/modules/organization/team-member/meta/import-export/export/exportHandlers';

const importModules = {
  contact: contactImportHandlers,
  product: productImportHandlers,
  user: userImportHandlers,
};

const exportModules = {
  contact: contactExportHandlers,
  product: productExportHandlers,
  user: userExportHandlers,
};

const modules = {
  import: importModules,
  export: exportModules,
};

const coreImportTypes = [
  {
    label: 'Customer',
    contentType: 'core:contact.customer',
  },
  {
    label: 'Lead',
    contentType: 'core:contact.lead',
  },
  {
    label: 'Company',
    contentType: 'core:contact.company',
  },
  {
    label: 'Product',
    contentType: 'core:product.product',
  },
  {
    label: 'Team member',
    contentType: 'core:user.user',
  },
];

const coreExportTypes = [
  {
    label: 'Customer',
    contentType: 'core:contact.customer',
  },
  {
    label: 'Company',
    contentType: 'core:contact.company',
  },
  {
    label: 'Product',
    contentType: 'core:product.product',
  },
  {
    label: 'Team member',
    contentType: 'core:user.user',
  },
];

export default async (app: Express) =>
  startImportExportWorker({
    pluginName: 'core',
    config: {
      import: {
        types: coreImportTypes,
        whenReady: () => {
          console.log('Import worker ready');
        },
        insertImportRows: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules: modules.import,
          methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
          extractModuleName: (input: TInsertImportRowsInput) =>
            input.moduleName,
          generateModels,
        }),
        getImportHeaders: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules: modules.import,
          methodName: TImportExportProducers.GET_IMPORT_HEADERS,
          extractModuleName: (input: TGetImportHeadersInput) =>
            input.moduleName,
          generateModels,
        }),
      },
      export: {
        types: coreExportTypes,
        getExportData: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules: modules.export,
          methodName: TImportExportProducers.GET_EXPORT_DATA,
          extractModuleName: (input: TGetExportDataInput) => input.moduleName,
          generateModels,
        }),
        getExportHeaders: createCoreModuleProducerHandler({
          moduleName: 'importExport',
          modules: modules.export,
          methodName: TImportExportProducers.GET_EXPORT_HEADERS,
          extractModuleName: (input: TGetExportHeadersInput) =>
            input.moduleName,
          generateModels,
        }),
      },
    },
    app,
  });
