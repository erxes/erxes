export interface ITemplate {
  _id: string;
  name: string;
  content: string;
  contentType?: string;
  description?: string;
  pluginType?: string;
  categoryIds?: string[];
  status?: 'active' | 'inactive';
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cursor?: string;
}

export interface ITemplateInput {
  name: string;
  content?: string;
  contentType: string;
  description?: string;
  pluginType?: string;
  categoryIds?: string[];
  status?: string;
}

export interface IPageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface ITemplateCategory {
  _id: string;
  name: string;
  parentId?: string;
  order?: string;
  code: string;
  contentType: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  status?: 'active' | 'inactive';
}

export interface ITemplateListResponse {
  templateList: {
    list: ITemplate[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
}

export interface ITemplateDetailResponse {
  templateDetail: ITemplate;
}

export interface ICategoryListResponse {
  categoryList: {
    list: ITemplateCategory[];
    totalCount: number;
  };
}
