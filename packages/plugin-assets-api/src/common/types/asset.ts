import { ICustomField } from '@erxes/api-utils/src/types';
import { Document } from 'mongoose';

export interface IAsset {
  name: string;
  parentId?: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  description?: string;
  unitPrice?: number;
  order: string;
  code: string;
  customFieldsData?: ICustomField[];
  assetId?: string;
  attachment?: any;
  attachmentMore?: any[];
  status?: string;
  assetCount?: number;
  vendorId?: string;
  vendorCode?: string;
  kbArticleIds: string[];
  knowledgeData?: any[];

  mergedIds?: string[];
}

export interface IAssetDocument extends IAsset, Document {
  _id: string;
  createdAt: Date;
}

export interface IAssetCategories {
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
}
export interface IAssetCategoriesDocument extends IAssetCategories, Document {
  _id: string;
  createdAt: Date;
}

export interface IMovement {
  itemIds: string[];
  userId: string;
  createdAt: Date;
  movedAt: Date;
}
export interface IMovementItem {
  assetId: string;
  assetName: string;
  branchId: string;
  customerId: string;
  departmentId: string;
  teamMemberId: string;
  companyId: string;
  movementId: string;
  sourceLocations: {
    branchId: string;
    departmentId: string;
    customerId: string;
    companyId: string;
    teamMemberId: string;
  };
}

export interface IMovementDocument extends IMovement, Document {
  _id: string;
  createdAt: Date;
}

export interface IMovementItemDocument extends IMovementItem, Document {
  _id: string;
  createdAt: Date;
}
