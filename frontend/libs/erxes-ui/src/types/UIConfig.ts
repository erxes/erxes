export type IUIConfig = {
  name: string;
  path: string;
  hasFloatingWidget?: boolean;
  settingsNavigation?: () => React.ReactNode;
  navigationGroup?: {
    name: string;
    icon: React.ElementType;
    content: () => React.ReactNode;
    subGroup?: () => React.ReactNode;
  };
  relationWidgets?: {
    name: string;
    icon?: React.ElementType;
  }[];
  modules?: {
    name: string;
    icon?: React.ElementType;
    path: string;
  }[];
};
