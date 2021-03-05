export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
}

export type IAttachmentPreview = {
  name: string;
  type: string;
  data: string;
} | null;

export interface IAnimatedLoader {
  height?: string;
  width?: string;
  color?: string;
  round?: boolean;
  margin?: string;
  marginRight?: string;
  isBox?: boolean;
  withImage?: boolean;
}

export interface IBreadCrumbItem {
  title: string;
  link?: string;
}

export interface ISubMenuItem {
  title: string;
  link?: string;
}

export interface IQueryParams {
  [key: string]: string;
}

export interface ISelectedOption {
  label: string;
  value: string;
}

export interface IConditionsRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

export type IDateColumn = {
  month: number;
  year: number;
};

export interface IFormProps {
  errors: any;
  values: any;
  registerChild: (child: React.ReactNode) => void;
  runValidations?: (callback: any) => void;
  resetSubmit?: () => void;
  isSubmitted: boolean;
  isSaved?: boolean;
}

export type IOption = {
  label: string;
  value: string;
  avatar?: string;
};

export type IButtonMutateProps = {
  name?: string;
  values: any;
  isSubmitted: boolean;
  confirmationUpdate?: boolean;
  callback?: () => void;
  resetSubmit?: () => void;
  size?: string;
  object?: any;
  text?: string;
  icon?: string;
  type?: string;
  disableLoading?: boolean;
};

export type IMentionUser = {
  id: string;
  avatar: string;
  fullName: string;
};

export type IEditorProps = {
  onCtrlEnter?: (evt?: any) => void;
  content: string;
  onChange: (evt: any) => void;
  height?: number | string;
  insertItems?: any;
  removeButtons?: string;
  removePlugins?: string;
  toolbarCanCollapse?: boolean;
  mentionUsers?: IMentionUser[];
  toolbar?: any[];
  autoFocus?: boolean;
  toolbarLocation?: 'top' | 'bottom';
  autoGrow?: boolean;
  autoGrowMinHeight?: number;
  autoGrowMaxHeight?: number;
  name?: string;
};

export type QueryResponse = {
  loading: boolean;
  refetch: () => void;
};
