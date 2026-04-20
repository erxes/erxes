export type IUIConfig = {
  name: string;
  path: string;
  icon?: React.ElementType;
  hasFloatingWidget?: boolean;
  settingsNavigation?: () => React.ReactNode;
  navigationGroup?: {
    name: string;
    icon: React.ElementType;
    content: () => React.ReactNode;
    /**
     * Module Federation expose key for the plugin's sub-navigation entry.
     * Must match an `exposes` key in the plugin's `module-federation.config.ts`
     * (e.g. `'subNavigation'`). The host loads it at runtime via `loadRemote`
     * so the plugin shares the host's React/Router/Jotai instances —
     * embedding lazy components here directly bypasses MF shared scope and
     * causes `useContext` crashes when more than one plugin is enabled.
     */
    subGroup?: string;
  };

  widgets?: {
    relationWidgets?: {
      name: string;
      icon?: React.ElementType;
    }[];
    customerDetailWidgets?: {
      name: string;
    }[];
  };
  modules?: {
    name: string;
    icon?: React.ElementType;
    path: string;
    hasAutomation?: boolean;
    hasRelationWidget?: boolean;
    hasFloatingWidget?: boolean;
    hasSegmentConfigWidget?: boolean;
  }[];
};

export type ICoreModule = {
  name: string;
  icon?: React.ElementType;
  path: string;
  hasSettings?: boolean;
  settingsOnly?: boolean;
  submenus?: {
    name: string;
    path: string;
    icon?: React.ElementType;
  }[];
};
