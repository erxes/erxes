import type { ApprovalLockState, IUser } from 'ui-modules';

export type IDocument = {
  _id: string;
  contentType: string;
  name?: string;
  content?: string | null;
  approvalLockState?: ApprovalLockState;
  createdAt?: string;
  createdUser?: IUser;
  tagIds?: string[];
};

export type IDocumentType = {
  name: string;
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
