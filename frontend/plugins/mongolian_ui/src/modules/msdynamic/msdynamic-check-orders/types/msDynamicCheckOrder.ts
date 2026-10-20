import type {
  MsdynamicPosOrdersListQuery,
  MsdynamicPosOrderDetailQuery,
} from '~/gql/graphql';
import { jsonArray, jsonRecord, jsonRecords } from '@/shared/utils/json';

export type IMSDynamicCheckOrder = NonNullable<
  NonNullable<
    NonNullable<MsdynamicPosOrdersListQuery['posOrdersList']>['list']
  >[number]
>;

export interface ISyncedOrderInfo {
  syncedBillNumber: string;
  syncedDate: string;
  syncedCustomer: string;
}

export interface IOrderItem {
  _id: string;
  productName?: string;
  count?: number;
  unitPrice?: number;
  discountAmount?: number;
}

export interface IPaidAmount {
  _id: string;
  type: string;
  amount: number;
}

export interface IPutResponse {
  billId: string;
  date: string;
}

export interface IDealInfo {
  _id: string;
  name?: string;
}

type PosOrderDetailData = NonNullable<
  MsdynamicPosOrderDetailQuery['posOrderDetail']
>;

export type IOrderCustomer = NonNullable<PosOrderDetailData['customer']>;

type PosOrderDetailJsonKey =
  | 'paidAmounts'
  | 'items'
  | 'putResponses'
  | 'deliveryInfo'
  | 'deal';

export type IPosOrderDetail = Partial<
  Omit<PosOrderDetailData, PosOrderDetailJsonKey>
> & {
  paidAmounts?: IPaidAmount[];
  items?: IOrderItem[];
  putResponses?: IPutResponse[];
  deliveryInfo?: { description?: string };
  deal?: IDealInfo;
};

export const toPosOrderDetail = (
  order: PosOrderDetailData,
): IPosOrderDetail => ({
  ...order,
  paidAmounts: jsonRecords<IPaidAmount>(jsonArray(order.paidAmounts)),
  items: jsonRecords<IOrderItem>(jsonArray(order.items)),
  putResponses: jsonRecords<IPutResponse>(jsonArray(order.putResponses)),
  deliveryInfo: jsonRecord<{ description?: string }>(order.deliveryInfo),
  deal: jsonRecord<IDealInfo>(order.deal),
});
