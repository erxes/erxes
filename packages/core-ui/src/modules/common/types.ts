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
