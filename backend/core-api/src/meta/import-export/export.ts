import {
  createCoreModuleProducerHandler,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TImportExportProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { contactExportHandlers } from '~/modules/contacts/meta/import-export/export/exportHandlers';
import { userExportHandlers } from '~/modules/organization/team-member/meta/import-export/export/exportHandlers';
import { productExportHandlers } from '~/modules/products/meta/import-export/export/exportHandlers';

const exportModules = {
  contacts: contactExportHandlers,
  product: productExportHandlers,
  organization: userExportHandlers,
};

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
export const exportConfiguration = {
  types: coreExportTypes,
  getExportData: createCoreModuleProducerHandler({
    moduleName: 'importExport',
    modules: exportModules,
    methodName: TImportExportProducers.GET_EXPORT_DATA,
    extractModuleName: (input: TGetExportDataInput) => input.moduleName,
    generateModels,
  }),
  getExportHeaders: createCoreModuleProducerHandler({
    moduleName: 'importExport',
    modules: exportModules,
    methodName: TImportExportProducers.GET_EXPORT_HEADERS,
    extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
    generateModels,
  }),
};
