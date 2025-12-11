import { Document } from 'mongoose';

import {
  ICursorPaginateParams,
  ICustomField,
  IListParams,
  IStringMap,
} from '../../common';
import { IAddress, ILocation } from './contacts-common';

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface ICustomer {
  state?: 'visitor' | 'lead' | 'customer';

  scopeBrandIds?: string[];
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: Date;
  sex?: number;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  primaryPhone?: string;
  phones?: string[];
  primaryAddress?: IAddress;
  addresses?: IAddress[];

  ownerId?: string;
  position?: string;
  department?: string;
  leadStatus?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  isSubscribed?: string;
  emailValidationStatus?: string;
  phoneValidationStatus?: string;
  links?: IStringMap;
  status?: string;
  code?: string;
  integrationId?: string;
  tagIds?: string[];

  mergedIds?: string[];
  relatedIntegrationIds?: string[];
  deviceTokens?: string[];
  trackedData?: ICustomField[];
  customFieldsData?: ICustomField[];
  lastSeenAt?: Date;
  isOnline?: boolean;
  sessionCount?: number;
  visitorContactInfo?: IVisitorContact;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  location?: ILocation;
  searchText?: string;
}

export interface ICustomerQueryFilterParams
  extends ICursorPaginateParams,
    IListParams {
  createdAt?: Date;
  type?: string;
  status?: string;
  dateFilters?: string;

  tagIds?: string[];
  excludeTagIds?: string[];
  tagWithRelated?: boolean;

  integrationIds?: string[];
  integrationTypes?: string[];

  brandIds?: string[];
}
