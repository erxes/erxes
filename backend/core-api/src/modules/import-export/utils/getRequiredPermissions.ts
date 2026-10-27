import { ImportExportMeta, splitType } from 'erxes-api-shared/core-modules';
import { getPlugin } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const toTypeKey = (type: string) => splitType(type).join(':');

/**
 * The permissions needed to import or export `entityType`.
 *
 * Types are compared in canonical form: the worker routes
 * `core:product.product` and `core:product:product` to the same handler, so
 * an exact string match let the second spelling fall back to the generic
 * permission. A type the plugin does not register is refused.
 */
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
  const typeKey = toTypeKey(entityType);
  const typeConfig = types.find(
    (type) => toTypeKey(type.contentType) === typeKey,
  );

  if (!typeConfig && types.length) {
    throw new Error(`Unknown ${operation} type: ${entityType}`);
  }

  if (typeConfig?.permissions?.length) {
    return typeConfig.permissions;
  }

  return operation === 'import' ? ['importsManage'] : ['exportsManage'];
};

export const checkImportExportPermissions = async ({
  checkPermission,
  ...type
}: {
  checkPermission: IContext['checkPermission'];
  pluginName: string;
  operation: 'import' | 'export';
  entityType: string;
}) => {
  const requiredPermissions = await getRequiredImportExportPermissions(type);

  for (const permission of requiredPermissions) {
    await checkPermission(permission);
  }
};
