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
    contentType: 'core:contacts.customers',
    permissions: ['customersImportManage'],
  },
  {
    label: 'Lead',
    contentType: 'core:contacts.leads',
    permissions: ['customersImportManage'],
  },
  {
    label: 'Company',
    contentType: 'core:contacts.companies',
    permissions: ['companiesImportManage'],
  },
  {
    label: 'Product',
    contentType: 'core:product.product',
    permissions: ['productsImportManage'],
  },
  {
    label: 'Team member',
    contentType: 'core:organization.users',
    permissions: ['teamMembersImportManage'],
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
