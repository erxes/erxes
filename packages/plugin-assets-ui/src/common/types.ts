import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IAttachment, QueryResponse } from '@erxes/ui/src/types';
import React from 'react';

export type CommonFormGroupTypes = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
};

export type IAssetCategoryTypes = {
  _id: string;
  name: string;
  order: string;
  code: string;
  parentId: string;
  description: string;
  status: string;
  attachment: IAttachment;
  isRoot: boolean;
  assetCount: number;
};

export type IAssetCategoryQeuryResponse = {
  assetCategories: IAssetCategoryTypes[];
  loading: boolean;
  refetch: () => void;
};

export type IAssetCategoriesTotalCountResponse = {
  assetCategoriesTotalCount: number;
} & QueryResponse;

export type IAssetQueryResponse = {
  assets: IAsset[];
  loading: boolean;
  refetch: (variables?: any) => void;
};

export type IMovementDetailQueryResponse = {
  assetMovement: IMovementType;
  loading: boolean;
  refetch: () => void;
};

export type IAssetTotalCountQueryResponse = {
  assetsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};
export type IAssetDetailQueryResponse = {
  assetDetail: IAsset;
  loading: boolean;
  refetch: () => void;
};
export interface IAssetCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  assetCount: number;
  isRoot: boolean;
}

export interface IAsset {
  _id: string;
  name: string;
  type: string;
  categoryId: string;
  parentId: string;
  description: string;
  order: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;

  attachment?: any;
  attachmentMore?: any[];
  assetCount: number;
  minimiumCount: number;
  category: IAssetCategory;
  parent: IAsset;
  childAssetCount: number;
  vendor?: ICompany;
  kbArticleIds: string[];
  knowledgeData?: any;
}

export interface IAssetDoc {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  customFieldsData?: any;
}

export type IAssetCategoryDetailQueryResponse = {
  assetCategoryDetail: IAssetCategory;
  loading: boolean;
};

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  createdAt?: Date;
};

export type AssetRemoveMutationResponse = {
  assetsRemove: (mutation: {
    variables: { assetIds: string[] };
  }) => Promise<any>;
};

export type AssetEditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type MergeMutationVariables = {
  assetIds: string[];
  assetFields: IAsset;
};

export type MergeMutationResponse = {
  assetsMerge: (params: { variables: MergeMutationVariables }) => Promise<any>;
};

export type SelectedVariables = {
  assetId: string;
  assetName?: string;
  departmentIds?: string[];
  branchIds?: string[];
  currentMovement?: object;
};

export type IMovementType = {
  _id?: string;
  assetIds?: string[];
  description?: string;
  assets?: IMovementItem[];
  createdAt?: string;
  modifiedAt?: string;
  movedAt?: string;
  userId?: string;
  user?: any;
};

export type IMovementItem = {
  _id?: string;
  assetId: string;
  assetDetail?: IAsset;
  branchId?: string;
  departmentId?: string;
  teamMemberId?: string;
  customerId?: string;
  companyId?: string;
  movementId: string;
  branch?: any;
  department?: any;
  company?: any;
  customer?: any;
  teamMember?: any;
  createdAt?: string;
  sourceLocations: {
    branchId?: string;
    departmentId?: string;
    teamMemberId?: string;
    customerId?: string;
    companyId?: string;
    movementId: string;
    branch?: any;
    department?: any;
    company?: any;
    customer?: any;
    teamMember?: any;
  };
};

export type MovementItemsQueryResponse = {
  assetMovementItems: IMovementItem[];
} & QueryResponse;

export type MovementItemsTotalCountQueryResponse = {
  assetMovementItemsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type MovementQueryResponse = {
  assetMovements: IMovementType[];
  loading: boolean;
  refetch: () => void;
};

export type MovementsTotalCountQueryResponse = {
  assetMovementTotalCount: number;
} & QueryResponse;
