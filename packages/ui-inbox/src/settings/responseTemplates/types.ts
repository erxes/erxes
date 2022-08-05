import { IBrand } from '@erxes/ui/src/brands/types';

export interface IResponseTemplate {
  _id: string;
  name: string;
  content: string;
  brandId: string;
  brand: IBrand;
  files: any;
}
