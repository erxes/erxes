import {
  ICursorPaginateParams,
  IListParams,
  IOffsetPaginateParams,
} from 'erxes-api-shared/core-types';
import { IFeaturedFieldOwner } from 'erxes-api-shared/core-modules';
import { Document } from 'mongoose';

export interface FieldOption {
  label: string;
  value: string;
  // Kept on the field when its owner drops it, since records may still hold it.
  deprecated?: boolean;
}

export interface IFeaturedFieldOwnerRef extends IFeaturedFieldOwner {
  key: string;
  status: 'active' | 'orphaned' | 'archived';
}

export interface IFeaturedFieldIndex {
  enabled: boolean;
  unique?: boolean;
  status: 'building' | 'ready' | 'failed';
}

export interface IObjectListFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea';
}

export interface IFieldConfigs {
  objectListConfigs?: IObjectListFieldConfig[];
}

export interface IField {
  name: string;
  code: string;
  groupId: string;
  contentType: string;
  contentTypeId: string;

  type: string;
  order: number;

  options?: FieldOption[];
  icon?: string;

  logics?: any;
  validations?: any;
  configs?: IFieldConfigs;

  isVisible?: boolean;
  isVisibleToCreate?: boolean;
  isRequired?: boolean;
  isVisibleInCard?: boolean;

  owner?: IFeaturedFieldOwnerRef;
  index?: IFeaturedFieldIndex;
}

export interface IFieldDocument extends IField, Document {
  _id: string;

  createdBy: string;
  updatedBy: string;
}

export interface IFieldParams extends IListParams {
  contentType: string;
  contentTypeId?: string;
  groupId?: string[];
  icon?: string;
}

export interface IFieldCursorParams extends ICursorPaginateParams {}
export interface IFieldOffsetParams extends IOffsetPaginateParams {}
