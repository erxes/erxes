import { typeDefs } from './apollo/typeDefs';

import { startPlugin } from 'erxes-api-shared/utils';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TGetImportHeadersInput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { postImportHandlers } from '@/cms/meta/import-export/import/importHandlers';
import { postExportHandlers } from '@/cms/meta/import-export/export/exportHandlers';

const postImportExportTypes = [
  {
    label: 'Post',
    contentType: 'content:post.post',
  },
];

startPlugin({
  name: 'content',
  port: 3303,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);

    context.models = models;

    return context;
  },
  importExport: {
    import: {
      types: postImportExportTypes,
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { post: postImportHandlers },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { post: postImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: postImportExportTypes,
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { post: postExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { post: postExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
    },
  },
});
