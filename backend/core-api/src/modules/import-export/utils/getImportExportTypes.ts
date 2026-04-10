import {
  ImportExportMeta,
  ImportExportTypeDefinition,
} from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

const toFallbackLabel = (contentType: string) => {
  const entityName =
    contentType.split('.').pop() || contentType.split(':').pop() || 'record';

  return entityName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getImportExportTypes = async (
  operation: 'import' | 'export',
): Promise<ImportExportTypeDefinition[]> => {
  const pluginNames = await getPlugins();
  const typesByContentType = new Map<string, ImportExportTypeDefinition>();

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const meta = plugin.config?.meta?.importExport as
      | ImportExportMeta
      | undefined;
    const types = meta?.[operation]?.types || [];

    for (const type of types) {
      if (!type?.contentType) {
        continue;
      }

      typesByContentType.set(type.contentType, {
        contentType: type.contentType,
        label: type.label?.trim() || toFallbackLabel(type.contentType),
      });
    }
  }

  return Array.from(typesByContentType.values()).sort((left, right) =>
    left.label.localeCompare(right.label),
  );
};
