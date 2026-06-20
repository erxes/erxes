import { BaseApi } from './base';
import { TdbOrderInput, TdbOrderCreateResponse, TdbOrderDetail } from '../@types/tdb';

export class OrdersApi extends BaseApi {
  /**
   * Create a payment order
   */
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
      data,
      useBasicAuth: true,
    });
  }

  /**
   * Get order details by order ID and password
   */
  async get(orderId: number, password: string): Promise<TdbOrderDetail> {
    return this.request({
      method: 'GET',
      params: { password },
      path: `${orderId}`,
      useBasicAuth: false,
    });
  }

  /**
   * Check if order status indicates successful payment
   */
  static isSuccessfulStatus(status: string): boolean {
    const successfulStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];
    return successfulStatuses.includes(status.toUpperCase());
  }

  /**
   * Get order with parsed success flag
   */
  async getWithStatus(orderId: number, password: string): Promise<{
    order: TdbOrderDetail['order'];
    isSuccessful: boolean;
  }> {
    const detail = await this.get(orderId, password);
    return {
      order: detail.order,
      isSuccessful: OrdersApi.isSuccessfulStatus(detail.order.status),
    };
  }
}