import type { EbarimtPutResponsesDuplicatedQuery } from '~/gql/graphql';
import { IAttachment } from 'erxes-ui';

export interface IDuplicatedItem {
  _id: string;
  name: string;
  barCode: string;
  barCodeType: string;
  classificationCode: string;
  measureUnit: string;
  qty: number;
  unitPrice: number;
  totalVAT: number;
  totalCityTax: number;
  totalAmount: number;
  scopeBrandIds: string[];
}

export interface IDuplicatedReceipt {
  _id: string;
  id: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  taxType: string;
  merchantTin: string;
  items: IDuplicatedItem[];
  scopeBrandIds: string[];
}

export type IDuplicated = NonNullable<
  NonNullable<
    EbarimtPutResponsesDuplicatedQuery['putResponsesDuplicated']
  >['list'][number]
>;

export interface IDuplicatedCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}
