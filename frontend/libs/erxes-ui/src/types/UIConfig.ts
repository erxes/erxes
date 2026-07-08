export type TPropertyInputMeta = Record<string, unknown>;

export type TActivityRowProps = {
  activity: {
    _id: string;
    activityType: string;
    sourcePlugin?: string;
    createdAt: string | Date;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
};

export type TPropertyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
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
    activityRows?: Record<string, React.ComponentType<TActivityRowProps>>;
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
