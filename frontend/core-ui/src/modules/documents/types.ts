import type { ApprovalLockState, IUser } from 'ui-modules';

export type IDocument = {
  _id: string;
  contentType: string;
  subType?: string | null;
  replacer?: string | null;
  code?: string | null;
  name?: string;
  content?: string | null;
  commentData?: string | null;
  approvalLockState?: ApprovalLockState;
  createdAt?: string;
  createdUser?: IUser;
  tagIds?: string[];
};

export type IDocumentType = {
  label: string;
  contentType: string;
  subTypes?: string[];
};

export type DocumentFilterState = {
  tagIds: string[] | null;
  searchValue: string | null;
  createdAt: string | null;
  createdBy: string | string[] | null;
  contentType: string | null;
};
