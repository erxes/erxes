export type TSearchPayload = Readonly<Record<string, unknown>>;

export type TSearchResultItem = {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  path: string;
  matchFields?: Array<{
    label: string;
    labelKey?: string;
    labelNamespace?: string;
    value: string;
  }>;
};

export type TSearchPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type TSearchSelection = {
  /** Globally unique alias. MUST start with `gs_<pluginName>_`. */
  alias: string;
  /** Root Query field, e.g. `customers`. Used for quarantine + diagnostics. */
  field: string;
  /** Arg body without parens, e.g. `searchValue: $searchValue, limit: $limit`. */
  args?: string;
  /** Selection set incl. braces. Omit for scalar fields like `productsTotalCount`. */
  body?: string;
  /** When true, an error on this alias does not fail the whole group. */
  optional?: boolean;
};

export type TSearchGroupResult = {
  items: TSearchResultItem[];
  totalCount: number;
  countMode: 'exact' | 'approximate';
  pageInfo: TSearchPageInfo;
};

export type TSearchProviderDefinition<TNode> = {
  /** Repo-unique, kebab-case, e.g. `sales-deals`. */
  key: string;
  /** English source of truth. */
  label: string;
  labelKey?: string;
  labelNamespace?: string;
  icon?: React.ElementType;
  order?: number;
  selections: TSearchSelection[];
  select: (payload: TSearchPayload) => {
    nodes: TNode[];
    totalCount?: number;
    pageInfo: TSearchPageInfo;
  };
  toItem: (node: TNode) => TSearchResultItem | null;
};

export type ISearchProvider = {
  key: string;
  label: string;
  labelKey?: string;
  labelNamespace?: string;
  icon?: React.ElementType;
  order?: number;
  selections: TSearchSelection[];
  resolve: (payload: TSearchPayload, limit: number) => TSearchGroupResult;
};

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
  i18nNamespace?: string;
  hasFloatingWidget?: boolean;
  settingsOnly?: boolean;
  settingsNavigation?: () => React.ReactNode;
  navigationGroup?: {
    name: string;
    defaultPath?: string;
    icon: React.ElementType;
    content: () => React.ReactNode;
    subGroup?: () => React.ReactNode;
  };

  widgets?: {
    relationWidgets?: {
      name: string;
      icon?: React.ElementType;
      label?: string;
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
  searchProviders?: ISearchProvider[];
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
