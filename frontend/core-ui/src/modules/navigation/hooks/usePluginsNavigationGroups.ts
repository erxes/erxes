import { IUIConfig } from 'erxes-ui';
import { useAtom } from 'jotai';
import {
  type ComponentType,
  type ElementType,
  type ReactNode,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { pluginsConfigState, usePermissionCheck, useVersion } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';

export const usePluginsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, hasPluginPermission, isWildcard } = usePermissionCheck();

  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'core-modules' });

  const CORE_MODULES = GET_CORE_MODULES(t, version);

  const modules = useMemo(() => {
    if (pluginsMetaData) {
      const pluginsModules = Object.values(pluginsMetaData || {}).flatMap(
        (plugin) => {
          if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
            return [];
          }

          return (plugin.modules || []).map((module) => ({
            ...module,
            pluginName: plugin.name,
          }));
        },
      );

      return [...CORE_MODULES, ...pluginsModules] as IUIConfig['modules'];
    }
    return CORE_MODULES;
  }, [pluginsMetaData, t, version, isLoaded, isWildcard, hasPluginPermission]);

  return modules;
};

export type NavigationGroupContent = ComponentType;

export interface NavigationGroupResult {
  icon?: ElementType;
  color?: string;
  description?: string;
  logo?: ReactNode;
  contents: NavigationGroupContent[];
  defaultPath: string;
  subGroups: NavigationGroupContent[];
  modules: NonNullable<IUIConfig['modules']>;
  name: string;
  i18n?: boolean;
}

type NavigationGroups = Record<string, NavigationGroupResult>;

export const usePluginsNavigationGroups = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, hasPluginPermission, isWildcard } = usePermissionCheck();

  const navigationGroups = useMemo(() => {
    if (!pluginsMetaData) {
      return {};
    }

    return Object.values(pluginsMetaData).reduce<NavigationGroups>(
      (acc, config) => {
        if (!config?.modules?.length) return acc;

        if (config.settingsOnly) return acc;

        if (isLoaded && !isWildcard && !hasPluginPermission(config.name)) {
          return acc;
        }

        const groupName = config.plugin?.name || config.name;

        const existingGroup = acc[groupName] || {
          contents: [],
          defaultPath:
            config.plugin?.defaultPath ||
            config.path ||
            config.modules?.[0]?.path ||
            '',
          subGroups: [],
          modules: [],
        };

        const newContent = config.plugin?.content;
        const updatedContents = newContent
          ? [...existingGroup.contents, newContent]
          : existingGroup.contents;

        const newSubGroup = config.plugin?.subGroup;
        const updatedSubGroups = newSubGroup
          ? [...existingGroup.subGroups, newSubGroup]
          : existingGroup.subGroups;

        acc[groupName] = {
          name: groupName,
          color: existingGroup.color ?? config.plugin?.color,
          description: existingGroup.description ?? config.plugin?.description,
          logo: existingGroup.logo ?? config.plugin?.logo,
          icon:
            config.plugin?.icon ||
            config.icon ||
            existingGroup.icon ||
            config.modules?.[0]?.icon,
          contents: updatedContents,
          defaultPath:
            config.plugin?.defaultPath ||
            existingGroup.defaultPath ||
            config.path ||
            config.modules?.[0]?.path ||
            '',
          subGroups: updatedSubGroups,
          modules: [...existingGroup.modules, ...(config.modules || [])],
          i18n: config.i18n || existingGroup.i18n,
        };

        return acc;
      },
      {},
    );
  }, [pluginsMetaData, isLoaded, isWildcard, hasPluginPermission]);

  return navigationGroups;
};
