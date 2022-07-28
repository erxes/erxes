import { QueryResponse } from '@erxes/ui/src/types';
export interface IPage {
  name: string;
  description: string;
  html: string;
  css: string;
  jsonData: any;
}

export interface IPageDoc extends IPage {
  _id: string;
}
export interface IField {
  code: string;
  text: string;
  type: string;
  show: boolean;
}
export interface IContentType {
  code: string;
  displayName: string;
  fields: IField[];
}

export interface IContentTypeDoc extends IContentType {
  _id: string;
}

export interface IEntryValue {
  fieldId: string;
  fieldCode: string;
  value: any;
}

export interface IEntry {
  contentTypeId: string;
  values: IEntryValue[];
}

export interface IEntryDoc extends IEntry {
  _id: string;
}

export interface ITemplate {
  name: string;
  jsonData: any;
}

export interface ITemplateDoc extends ITemplate {
  _id: string;
}

// query

// page
export type PagesQueryResponse = {
  webbuilderPages: IPageDoc[];
} & QueryResponse;

export type PageDetailQueryResponse = {
  webbuilderPageDetail: IPageDoc;
} & QueryResponse;

// content types
export type TypesQueryResponse = {
  webbuilderContentTypes: IContentTypeDoc[];
} & QueryResponse;

export type TypeDetailQueryResponse = {
  webbuilderContentTypeDetail: IContentTypeDoc;
} & QueryResponse;

// entry
export type EntriesQueryResponse = {
  webbuilderEntries: IEntryDoc[];
} & QueryResponse;

export type EntryDetailQueryResponse = {
  webbuilderEntryDetail: IEntryDoc;
} & QueryResponse;

// template
export type TemplatesQueryResponse = {
  webbuilderTemplates: ITemplateDoc;
} & QueryResponse;

// mutation

// page
export type PagesRemoveMutationResponse = {
  pagesRemoveMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};

export type PagesAddMutationResponse = {
  pagesAdd: (doc: { variables: IPage }) => Promise<any>;
};

export type PagesEditMutationResponse = {
  pagesEdit: (doc: { variables: { _id: string; doc: IPage } }) => Promise<any>;
};

// content type
export type TypesAddMutationResponse = {
  typesAddMutation: (doc: { variables: IContentType }) => Promise<any>;
};

export type TypesEditMutationResponse = {
  typesEditMutation: (doc: {
    variables: { _id: string; doc: IContentType };
  }) => Promise<any>;
};

export type TypesRemoveMutationResponse = {
  typesRemoveMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};

// entry
export type EntriesAddMutationResponse = {
  entriesAddMutation: (doc: { variables: IEntry }) => Promise<any>;
};

export type EntriesEditMutationResponse = {
  entriesEditMutation: (doc: {
    variables: { _id: string; doc: IEntry };
  }) => Promise<any>;
};

export type EntriesRemoveMutationResponse = {
  entriesRemoveMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};

// template
export type TemplatesAddMutationResponse = {
  templatesAdd: (doc: { variables: ITemplate }) => Promise<any>;
};

export type TemplatesRemoveMutationResponse = {
  templatesRemove: (doc: { variables: { _id: string } }) => Promise<any>;
};
