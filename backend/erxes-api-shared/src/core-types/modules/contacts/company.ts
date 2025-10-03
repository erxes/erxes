import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  ICustomField,
  IListParams,
  IStringMap,
} from '../../common';
import { IAddress } from './contacts-common';

export interface ICompany {
  scopeBrandIds?: string[];
  primaryName?: string;
  avatar?: string;
  names?: string[];
  size?: number;
  industry?: string;
  plan?: string;
  parentCompanyId?: string;

  primaryEmail?: string;
  emails?: string[];
  primaryAddress?: IAddress;
  addresses?: IAddress[];

  ownerId?: string;

  primaryPhone?: string;
  phones?: string[];

  mergedIds?: string[];
  status?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  isSubscribed?: string;
  links?: IStringMap;
  tagIds?: string[];
  customFieldsData?: ICustomField[];
  trackedData?: ICustomField[];
  website?: string;
  code?: string;
  location?: string;
}

export interface ICompanyDocument extends ICompany, Document {
  _id: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  searchText: string;
  score?: number;
}

export interface ICompanyFilterQueryParams
  extends IListParams,
    ICursorPaginateParams {
  status?: string;
  createdAt?: Date;
  dateFilters?: string;

  tagIds?: string[];
  excludeTagIds?: string[];
  tagWithRelated?: boolean;

  integrationIds?: string[];
  integrationTypes?: string[];

  brandIds?: string[];
}
