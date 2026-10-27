import { useQuery } from '@apollo/client';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import {
  currentUserState,
  DATA_EXTENSION_RECORD_TYPES,
  IDataExtensionRecordType,
  pluginsConfigState,
  IRelationModules,
  usePermissionCheck,
} from 'ui-modules';
import { Icon, IconVariable } from '@tabler/icons-react';
import apolloClient from '~/providers/apollo-provider/apolloClient';
import {
  CORE_RELATIONS,
  CORE_TRAILING_RELATIONS,
} from '../constants/core-relations';

/**
 * Content types with Data Extension fields, read from the metadata. The
 * client is passed directly: this runs above the ApolloProvider.
 */
const useDataExtensionsRelation = (): IRelationModules[] => {
  const currentUser = useAtomValue(currentUserState);
  const { data } = useQuery<{
    dataExtensionRecordTypes: IDataExtensionRecordType[];
  }>(DATA_EXTENSION_RECORD_TYPES, {
    client: apolloClient,
    skip: !currentUser,
    fetchPolicy: 'cache-and-network',
  });

  return useMemo(() => {
    const contentTypes = Array.from(
      new Set(
        (data?.dataExtensionRecordTypes || [])
          .filter((recordType) => recordType.fieldCount)
          .flatMap((recordType) => recordType.contentTypes),
      ),
    );

    if (!contentTypes.length) {
      return [];
    }

    return [
      {
        pluginName: 'core',
        name: 'dataExtensions',
        icon: IconVariable,
        label: 'Data extensions',
        contentTypes,
      },
    ];
  }, [data]);
};

export const useRelationWidgetsModules = (): IRelationModules[] => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();
  const dataExtensionsRelation = useDataExtensionsRelation();

  return useMemo(() => {
    if (!pluginsMetaData) {
      return [];
    }

    const pluginsRelationWidgets = Object.values(pluginsMetaData).flatMap(
      (plugin) => {
        if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
          return [];
        }

        return (plugin.widgets?.relationWidgets || []).map((module) => ({
          pluginName: plugin.name,
          icon: module.icon as Icon,
          name: module.name,
          label: module.label,
          contentTypes: module.contentTypes,
        }));
      },
    );

    return [
      ...CORE_RELATIONS,
      ...pluginsRelationWidgets,
      ...CORE_TRAILING_RELATIONS,
      ...dataExtensionsRelation,
    ];
  }, [
    pluginsMetaData,
    isLoaded,
    isWildcard,
    hasPluginPermission,
    dataExtensionsRelation,
  ]);
};
