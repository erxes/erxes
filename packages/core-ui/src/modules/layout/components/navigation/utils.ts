import { Plugin, ChildPlugin, PluginConfig } from "./types";

export const getLink = (url: string): string => {
  const storageValue = window.localStorage.getItem("pagination:perPage");

  let parsedStorageValue: Record<string, number>;

  try {
    parsedStorageValue = JSON.parse(storageValue || "") as Record<
      string,
      number
    >;
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

export const pluginNavigations = (): any[] => {
  const plugins: PluginConfig[] = (window as any).plugins || [];
  const navigationMenus: any[] = [
    {
      text: "Contacts",
      url: "/contacts/customer",
      icon: "icon-user",
      location: "mainNavigation",
      permission: "showCustomers"
    },
    {
      text: "Segments",
      url: "/segments",
      icon: "icon-chart-pie-alt",
      location: "mainNavigation",
      permission: "showSegments"
    },
    {
      text: "Forms",
      url: "/forms",
      icon: "icon-laptop",
      location: "mainNavigation",
      permission: "showForms"
    },
    {
      text: "Insight",
      url: "/insight",
      icon: "icon-reload",
      location: "mainNavigation"
    }
  ];

  const childMenus: any[] = [];

  for (const plugin of plugins) {
    for (const menu of plugin.menus || []) {
      if (menu.location === "settings") {
        childMenus.push(menu);
      }

      if (menu.location === "mainNavigation") {
        navigationMenus.push({
          ...menu,
          name: plugin.name
        });
      }

      navigationMenus[0].children = childMenus;
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
        (name === "inbox" && !(url || "").includes(child.scope)) ||
        (child.scope === "cards" &&
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
