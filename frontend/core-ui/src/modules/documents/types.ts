import type { ApprovalLockState, IUser } from 'ui-modules';

export type IDocument = {
  _id: string;
  contentType: string;
  name?: string;
  content?: string | null;
  commentState?: string | null;
  subType?: string | null;
  code?: string | null;
  replacer?: string | null;
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

export type DocumentAttribute = {
  label?: string;
  name: string;
  value?: string;
  groupDetail?: { name: string };
};

export type DocumentFilterState = {
  tagIds: string[] | null;
  searchValue: string | null;
  createdAt: string | null;
  createdBy: string | string[] | null;
  contentType: string | null;
};
