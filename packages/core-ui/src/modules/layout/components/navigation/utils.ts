import { Plugin, ChildPlugin, PluginConfig } from './types';

export const getLink = (url: string): string => {
  const storageValue = window.localStorage.getItem('pagination:perPage');

  let parsedStorageValue: Record<string, number>;

  try {
    parsedStorageValue = JSON.parse(storageValue || '') as Record<string, number>;
  } catch {
    parsedStorageValue = {};
  }

  if (url.includes('?')) {
    const pathname = url.split('?')[0];

    if (!url.includes('perPage') && parsedStorageValue[pathname]) {
      return `${url}&perPage=${parsedStorageValue[pathname]}`;
    }
    return url;
  }

  if (parsedStorageValue[url]) {
    return `${url}?perPage=${parsedStorageValue[url]}`;
  }

  return url;
};

export const pluginNavigations = (): any[] => {
  const plugins: PluginConfig[] = (window as any).plugins || [];
  const navigationMenus: any[] = [];
  const childMenus: any[] = [];
// console.log('plugins', plugins)
// console.log('navigationMenus', navigationMenus)
// console.log('childMenus', childMenus)
  for (const plugin of plugins) {
    for (const menu of plugin.menus || []) {
      if (menu.location === 'settings') {
        childMenus.push(menu);
      }

      if (menu.location === 'mainNavigation') {
        navigationMenus.push({
          ...menu,
          name: plugin.name,
          children: childMenus
        });
      }
    }
  }

  return navigationMenus;
};

export const getChildren = (plugin: Plugin): ChildPlugin[] => {
  const { children, name, url, text } = plugin;

  if (!children) return [];

  return (
    children &&
    children.filter((child: ChildPlugin) => {
      if (
        (name && child.scope !== name) ||
        (name === 'inbox' && !(url || '').includes(child.scope)) ||
        (child.scope === 'cards' &&
          !child.text.toLowerCase().includes(text.toLowerCase()))
      )
        return null;

      return child;
    })
  );
};

export const filterPlugins = (
  allPlugins: Plugin[],
  pinnedPlugins: Plugin[]
): Plugin[] => {
  pinnedPlugins.forEach(el => {
    allPlugins = allPlugins.filter(i => i.url !== el.url);
  });

  return allPlugins;
};
