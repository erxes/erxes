import { z } from 'zod';
import { BRANDS_FORM_SCHEMA } from './schema';

export interface IBrand {
  _id: string;
  code: string;
  createdAt: Date;
  description: string;
  memberIds: string[];
  name: string;
  userId: string;
  emailConfig: any;
}

export enum BrandsHotKeyScope {
  BrandsSettingsPage = 'brands-page',
  BrandsCreateSheet = 'add-brand',
}

export type TBrandsForm = z.infer<typeof BRANDS_FORM_SCHEMA>;

export interface IBrandData {
  brands: {
    list: IBrand[];
    totalCount: number;
  };
}
export type TAddBrandResult = {
  brandsAdd: TBrandsForm;
};
