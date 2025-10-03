import { IAttachment } from 'erxes-ui';

export interface IProduct {
  _id: string;
  name: string;
  unitPrice: number;
  code: string;
  categoryId: string;
  category: {
    _id: string;
    name: string;
  };
  tagIds: string[];
  uom: string;
  type: 'product' | 'service' | 'unique' | 'subscription';
}

export interface IProductCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}
