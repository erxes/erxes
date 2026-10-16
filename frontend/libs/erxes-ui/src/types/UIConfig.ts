import type {
  ApolloQueryResult,
  OperationVariables,
  QueryOptions,
} from '@apollo/client';

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

export type TProductRemainderProduct = {
  _id: string;
  code: string;
  remainder?: TProductRemainderValue | null;
};

export type TProductRemainderValue = {
  remainder?: number;
  remainders?: unknown[];
};

export type TProductRemainderPatch = {
  _id: string;
  remainder: TProductRemainderValue;
};

export type TProductRemainderQuery = <
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: QueryOptions<TVariables, TData>,
) => Promise<ApolloQueryResult<TData>>;

export type TProductRemainderProvider = (params: {
  products: TProductRemainderProduct[];
  pipelineId?: string;
  query: TProductRemainderQuery;
}) => Promise<TProductRemainderPatch[]>;

export type TPropertyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
};

/**
 * How a plugin appears in the shell: its entry in the plugin picker, its own
 * sidebar and its color. Plugins that use the same `name` share one entry, and
 * the first plugin that sets `color`, `description` or `logo` brands it.
 */
export type IUIPlugin = {
  name: string;
  defaultPath?: string;
  icon: React.ElementType;
  /** Any CSS color. Fills the logo and tints primary accents inside it. */
  color?: string;
  /** One line under the plugin name in the picker. */
  description?: string;
  /**
   * SVG content for a 48×48 viewBox, drawn on the plugin color, where
   * `currentColor` is that color. Without it the logo shows `icon`.
   */
  logo?: React.ReactNode;
  /** Sidebar menu items, rendered inside the plugin sidebar's main menu. */
  content: () => React.ReactNode;
  /** Extra sidebar groups below the main menu. */
  subGroup?: () => React.ReactNode;
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
  plugin?: IUIPlugin;

  widgets?: {
    relationWidgets?: {
      name: string;
      icon?: React.ElementType;
      label?: string;
    }[];
    // Sections a plugin adds to another plugin's settings page, e.g. what a
    // POS or a pipeline sends to loyalty.
    relationSettingsWidgets?: {
      name: string;
      icon?: React.ElementType;
      label?: string;
    }[];
    // Fields a plugin offers for picking its own records inside another
    // plugin's form, with whatever creating one there takes.
    recordPickerWidgets?: {
      name: string;
      contentType: string;
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
    productRemainderProviders?: TProductRemainderProvider[];
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
  description?: string;
  hasSettings?: boolean;
  settingsOnly?: boolean;
  submenus?: {
    name: string;
    path: string;
    icon?: React.ElementType;
  }[];
};
