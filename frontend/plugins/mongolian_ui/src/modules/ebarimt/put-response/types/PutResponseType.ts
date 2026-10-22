import type { EbarimtPutResponsesQuery } from '~/gql/graphql';
export interface IReceiptItem {
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

export interface IReceipt {
  _id: string;
  id: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  taxType: string;
  merchantTin: string;
  items: IReceiptItem[];
  scopeBrandIds: string[];
}

export type IPutResponse = NonNullable<
  NonNullable<
    NonNullable<EbarimtPutResponsesQuery['putResponses']>['list']
  >[number]
>;
