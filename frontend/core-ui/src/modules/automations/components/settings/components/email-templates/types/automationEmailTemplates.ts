export interface IAutomationEmailTemplate {
  _id: string;
  name: string;
  description?: string;
  content: string;
  createdByIds: string;
  createdAt: string;
  updatedAt: string;
  createdUser?: {
    _id: string;
    details: {
      fullName: string;
    };
  };
}

export interface IAutomationEmailTemplatesListResponse {
  list: IAutomationEmailTemplate[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

export interface ICreateAutomationEmailTemplateInput {
  name: string;
  description?: string;
  content: string;
}

export interface IUpdateAutomationEmailTemplateInput {
  _id: string;
  name: string;
  description?: string;
  content: string;
}
