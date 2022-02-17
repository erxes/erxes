import {
  IFormProps as IFormPropsC,
  IAttachment as IAttachmentC
} from '@erxes/ui/src/types';

export type IAttachment = IAttachmentC;

export type IFormProps = IFormPropsC;

export type IMentionUser = {
  id: string;
  avatar: string;
  username: string;
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
  isSubmitted?: boolean;
};
