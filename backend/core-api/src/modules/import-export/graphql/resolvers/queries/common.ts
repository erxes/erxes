import { getImportExportTypes } from '~/modules/import-export/utils/getImportExportTypes';

export const importExportCommonQueries = {
  async importExportTypes(
    _root: undefined,
    { operation }: { operation: 'IMPORT' | 'EXPORT' },
  ) {
    return getImportExportTypes(operation.toLowerCase() as 'import' | 'export');
  },
};
