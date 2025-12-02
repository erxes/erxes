import { getPlugin } from 'erxes-api-shared/utils';

interface ImportExportMeta {
  import?: {
    configured: boolean;
    hasGetImportHeaders?: boolean;
    hasInsertImportRows?: boolean;
  };
  export?: {
    configured: boolean;
    hasGetExportHeaders?: boolean;
    hasGetExportData?: boolean;
    hasUploadFile?: boolean;
  };
}

interface ValidateExportConfigOptions {
  pluginName: string;
  collectionName: string;
  requireGetExportHeaders?: boolean;
}

interface ValidateImportConfigOptions {
  pluginName: string;
  collectionName: string;
  requireGetImportHeaders?: boolean;
  requireInsertImportRows?: boolean;
}

export async function validateExportConfig({
  pluginName,
  collectionName,
  requireGetExportHeaders = true,
}: ValidateExportConfigOptions): Promise<void> {
  const plugin = await getPlugin(pluginName);

  if (!plugin) {
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  const { export: exportMeta } =
    (plugin.config.meta?.importExport as ImportExportMeta | undefined) || {};

  if (!exportMeta?.configured) {
    throw new Error(`Export not configured for ${collectionName} records`);
  }

  if (requireGetExportHeaders && !exportMeta.hasGetExportHeaders) {
    throw new Error('Export headers handler not found');
  }
}

export async function validateImportConfig({
  pluginName,
  collectionName,
  requireGetImportHeaders = true,
  requireInsertImportRows = true,
}: ValidateImportConfigOptions): Promise<void> {
  const plugin = await getPlugin(pluginName);

  if (!plugin) {
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  const { import: importMeta } =
    (plugin.config.meta?.importExport as ImportExportMeta | undefined) || {};

  if (!importMeta?.configured) {
    throw new Error(`Import not configured for ${collectionName} records`);
  }

  if (requireGetImportHeaders && !importMeta.hasGetImportHeaders) {
    throw new Error('Import headers handler not found');
  }

  if (requireInsertImportRows && !importMeta.hasInsertImportRows) {
    throw new Error('Insert import rows handler not found');
  }
}
