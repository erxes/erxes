import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { usePermissionCheck } from '../permissions/hooks/usePermissionCheck';
import { extensionsConfigState } from '../../states/extensionsConfigState';

/** The installed extensions the current user may use. */
export const useExtensions = () => {
  const extensions = useAtomValue(extensionsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  return useMemo(
    () =>
      isLoaded
        ? Object.entries(extensions)
            .filter(
              ([pluginName]) => isWildcard || hasPluginPermission(pluginName),
            )
            .map(([pluginName, config]) => ({ pluginName, config }))
        : [],
    [extensions, isLoaded, isWildcard, hasPluginPermission],
  );
};
