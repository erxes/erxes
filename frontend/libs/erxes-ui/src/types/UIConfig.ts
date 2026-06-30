export type TPropertyInputMeta = Record<string, unknown>;

export type TPropertyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
};

export type TFavoriteNameProps = {
  path: string;
  fallbackName: string;
};

export type TFavoritePathProps = {
  pathname: string;
  search: string;
};

export type IUIConfig = {
  name: string;
  path: string;
  icon?: React.ElementType;
  i18n?: boolean;
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
    formWidgets?: {
      name: string;
      contentType: string;
      icon?: React.ElementType;
    }[];
    propertyInputs?: Record<string, React.ComponentType<TPropertyInputProps>>;
  };
  modules?: {
    name: string;
    icon?: React.ElementType;
    path: string;
    favoriteName?: string | ((path: string) => string);
    favoriteNameComponent?: React.ComponentType<TFavoriteNameProps>;
    favoritePath?: string | ((location: TFavoritePathProps) => string);
    hasAutomation?: boolean;
    hasRelationWidget?: boolean;
    hasFloatingWidget?: boolean;
    hasSegmentConfigWidget?: boolean;
    submenus?: {
      name: string;
      path: string;
      icon?: React.ElementType;
      favoriteName?: string | ((path: string) => string);
      favoriteNameComponent?: React.ComponentType<TFavoriteNameProps>;
      favoritePath?: string | ((location: TFavoritePathProps) => string);
    }[];
  }[];
};

export type ICoreModule = {
  name: string;
  icon?: React.ElementType;
  path: string;
  favoriteName?: string | ((path: string) => string);
  favoriteNameComponent?: React.ComponentType<TFavoriteNameProps>;
  favoritePath?: string | ((location: TFavoritePathProps) => string);
  hasSettings?: boolean;
  settingsOnly?: boolean;
  submenus?: {
    name: string;
    path: string;
    icon?: React.ElementType;
    favoriteName?: string | ((path: string) => string);
    favoriteNameComponent?: React.ComponentType<TFavoriteNameProps>;
    favoritePath?: string | ((location: TFavoritePathProps) => string);
  }[];
};
