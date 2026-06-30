import { IUIConfig, TFavoritePathProps } from 'erxes-ui';
import { useIsFavorite } from './useIsFavorite';
import { useMutation } from '@apollo/client';
import { TOGGLE_FAVORITE } from '../graphql/mutations/toggleFavorite';
import { useLocation } from 'react-router-dom';
import { pluginsConfigState } from '../../../states/pluginsConfigState';
import { useAtomValue } from 'jotai';

type FavoritePathModule = {
  path: string;
  favoritePath?: string | ((location: TFavoritePathProps) => string);
  submenus?: FavoritePathModule[];
};

function matchesModulePath(pathname: string, modulePath: string): boolean {
  const urlPath = pathname.replace(/^\//, '');

  if (urlPath === modulePath) return true;

  if (!modulePath.includes(':')) {
    return urlPath.startsWith(`${modulePath}/`);
  }

  const urlParts = urlPath.split('/');
  const moduleParts = modulePath.split('/');

  if (moduleParts.length > urlParts.length) return false;

  return moduleParts.every(
    (part, index) => part.startsWith(':') || part === urlParts[index],
  );
}

function getDynamicParamCount(path: string): number {
  return path.split('/').filter((part) => part.startsWith(':')).length;
}

function flattenModules(
  modules: IUIConfig['modules'] = [],
): FavoritePathModule[] {
  return modules.flatMap((module) => [
    module,
    ...flattenModules(module.submenus),
  ]);
}

export const useToggleFavorite = () => {
  const { pathname, search } = useLocation();
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const modules = Object.values(pluginsConfig || {}).flatMap((plugin) =>
    flattenModules(plugin.modules),
  );
  const matchedModule = modules
    .sort((moduleA, moduleB) => {
      const moduleAParts = moduleA.path.split('/').length;
      const moduleBParts = moduleB.path.split('/').length;

      if (moduleBParts !== moduleAParts) return moduleBParts - moduleAParts;

      return (
        getDynamicParamCount(moduleA.path) - getDynamicParamCount(moduleB.path)
      );
    })
    .find((module) => matchesModulePath(pathname, module.path));

  const favoritePath =
    typeof matchedModule?.favoritePath === 'function'
      ? matchedModule.favoritePath({ pathname, search })
      : matchedModule?.favoritePath || pathname;

  const { isFavorite } = useIsFavorite({ path: favoritePath });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE);

  const toggleFavorite = () => {
    const type = pathname.includes('contacts') ? 'submenu' : 'module';
    toggleFavoriteMutation({
      variables: { type, path: favoritePath },
      refetchQueries: ['isFavorite', 'getFavoritesByCurrentUser'],
    });
  };

  return { isFavorite, toggleFavorite };
};
