import {
  createCoreModuleProducerHandler,
  TGetImportHeadersInput,
  TImportExportProducers,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { contactImportHandlers } from '~/modules/contacts/meta/import-export/import/importHandlers';
import { userImportHandlers } from '~/modules/organization/team-member/meta/import-export/import/importHandlers';
import { productImportHandlers } from '~/modules/products/meta/import-export/import/importHandlers';

const importModules = {
  contacts: contactImportHandlers,
  product: productImportHandlers,
  organization: userImportHandlers,
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

export const importConfiguration = {
  types: coreImportTypes,
  whenReady: () => {
    console.log('Import worker ready');
  },
  insertImportRows: createCoreModuleProducerHandler({
    moduleName: 'importExport',
    modules: importModules,
    methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
    extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
    generateModels,
  }),
  getImportHeaders: createCoreModuleProducerHandler({
    moduleName: 'importExport',
    modules: importModules,
    methodName: TImportExportProducers.GET_IMPORT_HEADERS,
    extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
    generateModels,
  }),
};
