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
    subGroup?: () => React.ReactNode;
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
    submenus?: {
      name: string;
      path: string;
      icon?: React.ElementType;
    }[];
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
