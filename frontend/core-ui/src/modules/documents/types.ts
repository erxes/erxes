import type { IUser } from 'ui-modules';

export type IDocument = {
  _id: string;
  contentType: string;
  name?: string;
  content?: string;
  createdAt?: string;
  createdUser?: IUser;
};

export type IDocumentType = {
  name: string;
  label: string;
  contentType: string;
  subTypes?: string[];
};

export type DocumentFilterState = {
  searchValue: string | null;
  createdAt: string | null;
  createdBy: string | string[] | null;
  contentType: string | null;
};
