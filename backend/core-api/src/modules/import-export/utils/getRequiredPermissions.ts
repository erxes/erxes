import { ImportExportMeta } from 'erxes-api-shared/core-modules';
import { getPlugin } from 'erxes-api-shared/utils';

export const getRequiredImportExportPermissions = async ({
  pluginName,
  operation,
  entityType,
}: {
  pluginName: string;
  operation: 'import' | 'export';
  entityType: string;
}): Promise<string[]> => {
  const plugin = await getPlugin(pluginName);

  const meta = plugin.config?.meta?.importExport as
    | ImportExportMeta
    | undefined;

  const types = meta?.[operation]?.types || [];
  const typeConfig = types.find((type) => type.contentType === entityType);

  if (typeConfig?.permissions?.length) {
    return typeConfig.permissions;
  }

  return operation === 'import' ? ['importsManage'] : ['exportsManage'];
};
