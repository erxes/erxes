import { IProductCategory, IProduct } from 'erxes-ui/lib/products/types';
import { IUser } from 'erxes-ui/lib/auth/types'
import { IBrand } from 'erxes-ui/lib/types'
import { ITag } from 'erxes-ui/lib/tags/types';

export type IConfigsMap = { [key: string]: any };

// types
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
};

export type IScreenConfig = {
  isActive: boolean;
  type: string;
  value: number;
};

export type IPos = {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  integrationId: string;
  productDetails: [string];
  adminIds: [string];
  cashierIds: [string];
  integration: IIntegration;
  user: IUser;
  waitingScreen?: IScreenConfig;
  kioskMachine?: IScreenConfig;
  kitchenScreen?: IScreenConfig;
  uiOptions?: any;
  formSectionTitle?: string;
  formIntegrationIds: string[];
  ebarimtConfig: any;
};

// query types
export type PosListQueryResponse = {
  posList: IPos[];
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
  name: string;
  isActive: boolean;
  tags: ITag[];
  brand: IBrand;
  brandId: string;
}

export type IntegrationsQueryResponse = {
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

export type TagCountQueryResponse = {
  [key: string]: number;
};

export type IntegrationDetailQueryResponse = {
  integrationDetail: IIntegration;
} & QueryResponse;

export type PosDetailQueryResponse = {
  posDetail: IPos;
} & QueryResponse;

export type IntegrationMutationVariables = {
  brandId: string;
  name: string;
  description: string;
  productDetails: string[];
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
    variables: { _id: string } & IntegrationMutationVariables;
  }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id } }) => Promise<any>;
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

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

export type GroupsBulkInsertMutationResponse = {
  productGroupsBulkInsertMutation: (params: {
    variables: {
      posId: string;
      groups: IProductGroup[];
    };
  }) => Promise<void>;
};

export interface IProductShema {
  [key: string]: any;
}

export type SchemaLabelsQueryResponse = {
  getDbSchemaLabels: IProductShema[];
} & QueryResponse;
