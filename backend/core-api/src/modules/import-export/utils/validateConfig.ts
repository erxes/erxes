import { ImportExportMeta } from 'erxes-api-shared/core-modules';
import { getPlugin, redis } from 'erxes-api-shared/utils';

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

async function getImportExportMeta(
  pluginName: string,
): Promise<ImportExportMeta | undefined> {
  const plugin = await getPlugin(pluginName);

  if (!plugin) {
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  const meta = plugin.config.meta?.importExport as ImportExportMeta | undefined;

  if (meta) return meta;

  const configJson = await redis.get(`erxesservice:config:${pluginName}`);
  if (configJson) {
    try {
      const config = JSON.parse(configJson);
      return config?.meta?.importExport as ImportExportMeta | undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export async function validateExportConfig({
  pluginName,
  collectionName,
  requireGetExportHeaders = true,
}: ValidateExportConfigOptions): Promise<void> {
  const importExportMeta = await getImportExportMeta(pluginName);
  const exportMeta = importExportMeta?.export;

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
  const importExportMeta = await getImportExportMeta(pluginName);
  const importMeta = importExportMeta?.import;

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
