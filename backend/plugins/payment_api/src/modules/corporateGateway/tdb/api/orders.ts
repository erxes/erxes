import { BaseApi } from './base';
import {
  TdbOrderInput,
  TdbOrderCreateResponse,
  TdbOrderDetail,
} from '@/corporateGateway/tdb/@types/tdb';

export class OrdersApi extends BaseApi {
  async create(input: TdbOrderInput): Promise<TdbOrderCreateResponse> {
    const data = {
      order: {
        typeRid: input.typeRid || 'purch',
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        language: input.language || 'mn',
        hppRedirectUrl: input.hppRedirectUrl,
      },
    };

    return this.request({
      method: 'POST',
      path: 'order',
      data,
    });
  }

  async get(orderId: number, password: string): Promise<TdbOrderDetail> {
    return this.request({
      method: 'GET',
      path: `${orderId}`,
      params: { password },
    });
  }

  static isSuccessfulStatus(status: string): boolean {
    const successfulStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];

    return successfulStatuses.includes(status.toUpperCase());
  }

  async getWithStatus(orderId: number, password: string) {
    const detail = await this.get(orderId, password);

    return {
      order: detail.order,
      isSuccessful: OrdersApi.isSuccessfulStatus(detail.order.status),
    };
  }
}
