import { IProductCategory, IProduct, IBrand, IUser } from 'erxes-ui/lib/products/types';
import { ITag } from 'erxes-ui/lib/tags/types';

export type IConfigsMap = { [key: string]: any };

// types 
export type IPosConfig = {
  _id: string;
  integrationId: string;
  productDetails: string[];
  productGroupIds: string[];
};

export type IProductGroup = {
  _id: string;
  name: string;
  description: string;
  categoryIds: string[];
  excludedCategoryIds: string[];
  excludedProductIds: string[];
  categories: IProductCategory[];
  excludedCategories: IProductCategory[];
  excludedProducts: IProduct[];
}

export type IPos = {
  _id: string;
  name: string;
  description: string;
  createdAt: Date
  integrationId: string
  productDetails: [string]
  productGroupIds: [string]
}

// query types
export type ConfigsQueryResponse = {
  posConfigs: IPosConfig[];
  loading: boolean;
  refetch: () => void;
};

export type PosListQueryResponse = {
  allPos: IPos[];
  loading: boolean;
  refetch: () => void;
};

export type GroupsQueryResponse = {
  productGroups: IProductGroup[];
  loading: boolean;
  refetch: () => void;
};


// mutation types
export type PosRemoveMutationResponse = {
  removePos: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export type Counts = {
  [key: string]: number;
};

export type QueryResponse = {
  loading: boolean;
  refetch: () => void;
  error?: string;
};

export type BrandsQueryResponse = {
  brands: IBrand[];
} & QueryResponse;


export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId?: string;
  brand: IBrand;
  isActive?: boolean;
  createdUser: IUser;
  tags: ITag[];
}

export type PosIntegrationsQueryResponse = {
  integrations: IIntegration[];
} & QueryResponse;

export type IntegrationsCount = {
  total: number;
  byTag: Counts;
  byBrand: Counts;
  byKind: Counts;
  byStatus: Counts;
};

export type CountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
} & QueryResponse;

export type IntegrationDetailQueryResponse = {
  integrationDetail: IIntegration;
} & QueryResponse;

export type PosConfigQueryResponse = {
  posConfig: IPosConfig;
} & QueryResponse;

export type PosDetailQueryResponse = {
  posDetail: IPos;
} & QueryResponse;

export type IntegrationMutationVariables = {
  brandId: string;
  name: string;
  description: string;
  productDetails: string[];
  productGroupIds: string[];
};

export type EditIntegrationMutationResponse = {
  editIntegrationMutation: (params: {
    variables: IntegrationMutationVariables;
  }) => Promise<void>;
};

export type AddPosMutationResponse = {
  addPosMutation: (params: {
    variables: IntegrationMutationVariables;
  }) => Promise<any>;
};

export type EditPosMutationResponse = {
  editPosMutation: (params: {
    variables: { _id: string; } & IntegrationMutationVariables;
  }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: {
    variables: { _id };
  }) => Promise<any>;
};

export type CopyMutationResponse = {
  copyMutation: (params: { variables: { _id: string } }) => Promise<void>;
};

export type ArchiveIntegrationResponse = {
  archiveIntegration: (params: {
    variables: { _id: string; status: boolean };
  }) => Promise<any>;
};

export type ITagTypes =
  | 'conversation'
  | 'customer'
  | 'engageMessage'
  | 'company'
  | 'integration';

export type TagsQueryResponse = {
  tags: ITag[];
  loading: boolean;
  refetch: () => void;
};

export type TagMutationVariables = {
  type: string;
  targetIds: string[];
  tagIds: string[];
};

export type TagMutationResponse = {
  tagMutation: (params: { variables: TagMutationVariables }) => Promise<any>;
};

export type IButtonMutateProps = {
  name?: string;
  values: any;
  isSubmitted: boolean;
  confirmationUpdate?: boolean;
  callback?: () => void;
  resetSubmit?: () => void;
  size?: string;
  object?: any;
  text?: string;
  icon?: string;
  type?: string;
  disableLoading?: boolean;
};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;