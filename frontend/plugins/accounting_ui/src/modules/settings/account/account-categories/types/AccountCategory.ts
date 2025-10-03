import { accountCategorySchema } from '../constants/accountCategorySchema';
import { z } from 'zod';

export interface IAccountCategory {
  _id: string;
  createdAt?: Date;
  name: string;
  code: string;
  order?: string;
  scopeBrandIds?: string[];
  description?: string;
  parentId?: string;
  status?: string;
  mergeIds?: string[];
  maskType?: string;
  mask?: any;
  accountsCount?: number;
}

export type TAccountCategoryForm = z.infer<typeof accountCategorySchema>;
