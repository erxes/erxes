import { QueryResponse } from '@erxes/ui/src/types';
export interface IPage {
  name: string;
  description: string;
  html: string;
  css: string;
  jsonData: any;
  siteId: string;
}

export interface IPageDoc extends IPage {
  _id: string;
  site: ISiteDoc;
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
  siteId: string;
}

export interface IContentTypeDoc extends IContentType {
  _id: string;
  site: ISiteDoc;
}

export interface IEntryValue {
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
  html: string;
}

export interface ITemplateDoc extends ITemplate {
  _id: string;
}

export interface ISite {
  name: string;
  domain: string;
}

export interface ISiteDoc extends ISite {
  _id: string;
}

// query
export type PagesMainQueryResponse = {
  webbuilderPagesMain: { list: IPageDoc[]; totalCount: number };
} & QueryResponse;

export type PageDetailQueryResponse = {
  webbuilderPageDetail: IPageDoc;
} & QueryResponse;

// content types
export type TypesQueryResponse = {
  webbuilderContentTypes: IContentTypeDoc[];
} & QueryResponse;

export type TypesMainQueryResponse = {
  webbuilderContentTypesMain: { list: IContentTypeDoc[]; totalCount: number };
} & QueryResponse;

export type TypeDetailQueryResponse = {
  webbuilderContentTypeDetail: IContentTypeDoc;
} & QueryResponse;

// entry
export type EntriesMainQueryResponse = {
  webbuilderEntriesMain: { list: IEntryDoc[]; totalCount: number };
} & QueryResponse;

export type EntryDetailQueryResponse = {
  webbuilderEntryDetail: IEntryDoc;
} & QueryResponse;

// template
export type TemplatesQueryResponse = {
  webbuilderTemplates: ITemplateDoc[];
} & QueryResponse;

export type TemplatesDetailQueryResponse = {
  webbuilderTemplateDetail: ITemplateDoc;
} & QueryResponse;

export type TemplatesTotalCountQueryResponse = {
  webbuilderTemplatesTotalCount: number;
} & QueryResponse;

// site
export type SitesQueryResponse = {
  webbuilderSites: ISiteDoc[];
} & QueryResponse;

export type SitesTotalCountQueryResponse = {
  webbuilderSitesTotalCount: number;
} & QueryResponse;

export type SiteDetailQueryResponse = {
  webbuilderSiteDetail: ISiteDoc;
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
export type TemplatesUseMutationResponse = {
  templatesUse: (doc: {
    variables: { _id: string; name: string };
  }) => Promise<any>;
};

// site

export type SitesAddMutationResponse = {
  sitesAddMutation: (doc: { variables: ISite }) => Promise<any>;
};

export type SitesEditMutationResponse = {
  sitesEditMutation: (doc: {
    variables: { _id: string } & ISite;
  }) => Promise<any>;
};

export type SitesRemoveMutationResponse = {
  sitesRemoveMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};
