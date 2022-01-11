import { Document } from 'mongoose';

import { ILink, ICustomField } from './common';

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

  ownerId?: string;

  primaryPhone?: string;
  phones?: string[];

  mergedIds?: string[];
  status?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  isSubscribed?: string;
  links?: ILink;
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
  modifiedAt: Date;
  searchText: string;
  score?: number;
}
