import { Document } from 'mongoose';

export interface IPortalCompany {
  erxesCompanyId: string;
  productCategoryIds?: string[];
  clientPortalId: string;
}

export interface IPortalCompanyDocument extends IPortalCompany, Document {
  _id: string;
  createdAt?: Date;
}
