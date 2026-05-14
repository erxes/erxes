export type IDocumentType = {
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
