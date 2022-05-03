import { Plugin }from './types';

export const getLink = (url: string) => {
  const storageValue = window.localStorage.getItem("pagination:perPage");

  let parsedStorageValue: any;

  try {
    parsedStorageValue = JSON.parse(storageValue || "");
  } catch {
    parsedStorageValue = {};
  }

  if (url.includes("?")) {
    const pathname = url.split("?")[0];

    if (!url.includes("perPage") && parsedStorageValue[pathname]) {
      return `${url}&perPage=${parsedStorageValue[pathname]}`;
    }
    return url;
  }

  if (parsedStorageValue[url]) {
    return `${url}?perPage=${parsedStorageValue[url]}`;
  }

  return url;
};

export const pluginNavigations = () => {
  const plugins: any[] = (window as any).plugins || [];
  const navigationMenus: any[] = [];
  const childMenus: any[] = [];

  for (const plugin of plugins) {
    for (const menu of plugin.menus || []) {
      if (menu.location === "settings") {
        childMenus.push(menu);
      }

      if (menu.location === "mainNavigation") {
        navigationMenus.push({
          ...menu,
          name: plugin.name,
          children: childMenus,
        });
      }
    }
  }

  return navigationMenus;
};

export const filterPlugins = (allPlugins: Plugin[], pinnedPlugins: Plugin[]) => {
  pinnedPlugins.forEach((el) => {
    allPlugins = allPlugins.filter((i) => i.url !== el.url);
  });

  return allPlugins;
};
