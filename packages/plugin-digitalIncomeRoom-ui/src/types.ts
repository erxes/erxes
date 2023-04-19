// export interface IDigitalIncomeRoom {
//   _id: string;
//   name?: string;
//   createdAt?: Date;
//   expiryDate?: Date;
//   totalObjectCount?: number;
//   checked?: boolean;
//   typeId?: string;
//   currentType?: IType;
// }

// export interface IType {
//   _id: string;
//   name: string;
// }

// // queries
// export type DigitalIncomeRoomQueryResponse = {
//   digitalIncomeRooms: IDigitalIncomeRoom[];
//   refetch: () => void;
//   loading: boolean;
// };
// export type TypeQueryResponse = {
//   digitalIncomeRoomTypes: IType[];
//   refetch: () => void;
//   loading: boolean;
// };

// // mutations
// export type MutationVariables = {
//   _id?: string;
//   name: string;
//   createdAt?: Date;
//   expiryDate?: Date;
//   checked?: boolean;
//   type?: string;
// };
// export type AddMutationResponse = {
//   addMutation: (params: { variables: MutationVariables }) => Promise<any>;
// };

// export type EditMutationResponse = {
//   editMutation: (params: { variables: MutationVariables }) => Promise<any>;
// };

// export type RemoveMutationResponse = {
//   removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
// };

// export type EditTypeMutationResponse = {
//   typesEdit: (params: { variables: MutationVariables }) => Promise<any>;
// };

// export type RemoveTypeMutationResponse = {
//   typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
// };

import { IAttachment, QueryResponse } from '@erxes/ui/src/types';

import { IUser } from '@erxes/ui/src/auth/types';

export interface IPage {
  name: string;
  description: string;
  html: string;
  css: string;
  siteId: string;
  createdUser?: IUser;
  updatedUser?: IUser;
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
  _id: string;
  code: string;
  displayName: string;
  entries: IEntry[];
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
  html: string;
  image: string;
  categories: string;
}

export interface ITemplateDoc extends ITemplate {
  _id: string;
}

export interface ISite {
  name: string;
  domain: string;
  templateImage?: string;
  coverImage: IAttachment;
}

export interface ISiteDoc extends ISite {
  _id: string;
}

// query
export type PagesMainQueryResponse = {
  digitalIncomeRoomPagesMain: { list: IPageDoc[]; totalCount: number };
} & QueryResponse;

export type PageDetailQueryResponse = {
  digitalIncomeRoomPageDetail: IPageDoc;
} & QueryResponse;

// content types
export type TypesQueryResponse = {
  digitalIncomeRoomContentTypes: IContentTypeDoc[];
} & QueryResponse;

export type TypesMainQueryResponse = {
  digitalIncomeRoomContentTypesMain: {
    list: IContentTypeDoc[];
    totalCount: number;
  };
} & QueryResponse;

export type TypeDetailQueryResponse = {
  digitalIncomeRoomContentTypeDetail: IContentTypeDoc;
} & QueryResponse;

// entry
export type EntriesMainQueryResponse = {
  digitalIncomeRoomEntriesMain: { list: IEntryDoc[]; totalCount: number };
} & QueryResponse;

export type EntryDetailQueryResponse = {
  digitalIncomeRoomEntryDetail: IEntryDoc;
} & QueryResponse;

// template
export type TemplatesQueryResponse = {
  digitalIncomeRoomTemplates: ITemplateDoc[];
} & QueryResponse;

export type TemplatesDetailQueryResponse = {
  digitalIncomeRoomTemplateDetail: ITemplateDoc;
} & QueryResponse;

export type TemplatesTotalCountQueryResponse = {
  digitalIncomeRoomTemplatesTotalCount: number;
} & QueryResponse;

// site
export type SitesQueryResponse = {
  digitalIncomeRoomSites: ISiteDoc[];
} & QueryResponse;

export type SitesTotalCountQueryResponse = {
  digitalIncomeRoomSitesTotalCount: number;
} & QueryResponse;

export type SiteDetailQueryResponse = {
  digitalIncomeRoomSiteDetail: ISiteDoc;
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
    variables: { _id: string; name: string; coverImage?: string };
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

export type SitesDuplicateMutationResponse = {
  sitesDuplicateMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};
