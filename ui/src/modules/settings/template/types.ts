import { ITag } from 'modules/tags/types';
import { IProductCategory } from '../productService/types';
export interface IProductTemplateItem {
  _id: string;
  categoryId: string;
  itemId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export interface IProductTemplate {
  _id: string;
  type: string;
  title: string;
  discount: number;
  totalAmount: number;
  description: string;
  templateItems: IProductTemplateItem[];
  status: string;
  tags: ITag[];    
}

// query types

export type ProductTemplatesQueryResponse = {
  productTemplates: IProductTemplate[];
  loading: boolean;
  refetch: () => void;
}

export type ProductTemplateTotalCountQueryResponse = {
  productTemplateTotalCount: number;
  loading: boolean;
  refetch: () => void;
}

export type ProductTemplateDetailQueryResponse = {
  productTemplateDetail: IProductTemplate;
  loading: boolean;
}

export type MutationVariables = {
  _id?: string;
  type: string;
  title: string;
  discount: string;
  totalAmount: number;
  description: string;
  templateItems: IProductTemplateItem[];
  status: string;
};

// mutation types

export type AddMutationResponse = {
  addMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type ProductTemplatesRemoveMutationResponse = {
  productTemplatesRemove: (mutation: {
    variables: { ids: string[] };
  }) => Promise<any>;
};

export type ProductTemplatesChangeStatusMutionResponse = {
  productTemplatesChangeStatus: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;
};

export type ProductTemplatesDuplicateMutionResponse = {
  productTemplatesDuplicate: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
  loading: boolean;  
}

export type CountByTagsQueryResponse = {
  productTemplateCountByTags: { [key: string]: number };
  loading: boolean;
};