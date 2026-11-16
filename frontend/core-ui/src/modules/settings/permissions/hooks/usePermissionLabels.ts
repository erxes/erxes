import { useTranslation } from 'react-i18next';
import {
  IDefaultPermissionGroup,
  IPermissionAction,
  IPermissionModule,
} from '@/settings/permissions/types';

type TPermissionScope = IPermissionModule['scopes'][number];

export const usePermissionLabels = () => {
  const { t, ready } = useTranslation('permissions', { useSuspense: false });

  const getModuleName = (plugin: string, module: IPermissionModule): string =>
    t(`${plugin}.${module.name}.name`, { defaultValue: module.name });

  const getModuleDescription = (
    plugin: string,
    module: IPermissionModule,
  ): string =>
    module.description
      ? t(`${plugin}.${module.name}.description`, {
          defaultValue: module.description,
        })
      : '';

  const getScopeDescription = (
    plugin: string,
    moduleName: string,
    scope: TPermissionScope,
  ): string =>
    t(`${plugin}.${moduleName}.scopes.${scope.name}`, {
      defaultValue: scope.description,
    });

  const getActionTitle = (
    plugin: string,
    moduleName: string,
    action: IPermissionAction,
  ): string =>
    t(`${plugin}.${moduleName}.actions.${action.name}.title`, {
      defaultValue: action.title || action.name,
    });

  const getActionDescription = (
    plugin: string,
    moduleName: string,
    action: IPermissionAction,
  ): string =>
    action.description
      ? t(`${plugin}.${moduleName}.actions.${action.name}.description`, {
          defaultValue: action.description,
        })
      : '';

  const getGroupDescription = (group: IDefaultPermissionGroup): string =>
    group.description
      ? t(`groups.${group.id}.description`, {
          defaultValue: group.description,
          nsSeparator: false,
        })
      : '';

  return {
    ready,
    getGroupDescription,
    getModuleName,
    getModuleDescription,
    getScopeDescription,
    getActionTitle,
    getActionDescription,
  };
};
