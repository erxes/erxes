import { JSONContent } from 'erxes-ui';
import { IUser } from 'ui-modules';

export type TEmailContentFormat = 'blocks' | 'maily';

export interface IEmailTemplate {
  _id: string;
  name: string;
  description?: string;
  /** Written in the block editor. */
  content?: string;
  /** Written in the email editor. */
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  createdUser?: IUser;
}

export interface IEmailTemplatesListResponse {
  list: IEmailTemplate[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

export type TEmailTemplateInput = {
  name: string;
  description?: string;
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
};

/**
 * Templates written before the email editor carry no marker, and block
 * content is what that used to mean — the same rule the backend applies.
 */
export const emailTemplateFormat = (
  template?: Pick<IEmailTemplate, 'contentFormat' | 'contentJson'>,
): TEmailContentFormat =>
  template?.contentFormat || (template?.contentJson ? 'maily' : 'blocks');
