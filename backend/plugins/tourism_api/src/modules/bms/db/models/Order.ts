import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IOrder,
  IOrderCreateInput,
  IOrderDocument,
  IRecordPaymentInput,
  PaymentStatus,
} from '@/bms/@types/order';
import { orderSchema } from '@/bms/db/definitions/order';
import { computeOrderPricing } from '@/bms/services/orderPricing';

export interface IOrderModel extends Model<IOrderDocument> {
  createOrder(
    input: IOrderCreateInput,
    userId?: string,
  ): Promise<IOrderDocument>;
  getOrder(_id: string): Promise<IOrderDocument>;
  updateOrder(_id: string, doc: Partial<IOrder>): Promise<IOrderDocument>;
  removeOrder(ids: string[]): Promise<any>;
  recordPayment(
    _id: string,
    input: IRecordPaymentInput,
  ): Promise<IOrderDocument>;
}

export const loadOrderClass = (models: IModels) => {
  class Order {
    public static async getOrder(_id: string) {
      const order = await models.Orders.findOne({ _id });
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    }

    public static async createOrder(
      input: IOrderCreateInput,
      userId?: string,
    ) {
      const tour = await models.Tours.getTour(input.tourId);

      const computed = computeOrderPricing(tour, {
        packageId: input.packageId,
        people: input.people,
        singleSupplement: input.singleSupplement,
        includeDomesticFlight: input.includeDomesticFlight,
      });

      const now = new Date();
      return models.Orders.create({
        branchId: input.branchId,
        primaryCustomerId: input.primaryCustomerId,
        tourId: tour._id,
        tourName: tour.name,
        tourStartDate: tour.startDate,
        tourEndDate: tour.endDate,
        ...computed,
        people: input.people,
        travelers: input.travelers ?? [],
        status: 'confirmed',
        payment: {
          status: 'pending',
          paidAmount: 0,
          transactions: [],
        },
        note: input.note,
        internalNote: input.internalNote,
        createdBy: userId,
        createdAt: now,
        modifiedAt: now,
      });
    }

    public static async updateOrder(_id: string, doc: Partial<IOrder>) {
      // Pricing, prepaid, and package fields are immutable after creation.
      // Re-pricing requires cancelling and creating a new order.
      const { pricing, prepaid, package: pkg, ...safeDoc } = doc as any;

      await models.Orders.updateOne(
        { _id },
        { $set: { ...safeDoc, modifiedAt: new Date() } },
      );

      return models.Orders.findOne({ _id });
    }

    public static async recordPayment(
      _id: string,
      input: IRecordPaymentInput,
    ) {
      const order = await models.Orders.getOrder(_id);

      const newPaid = order.payment.paidAmount + input.amount;
      const total = order.pricing.totalAmount;

      let paymentStatus: PaymentStatus;
      if (newPaid >= total) {
        paymentStatus = 'paid';
      } else if (newPaid > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'pending';
      }

      await models.Orders.updateOne(
        { _id },
        {
          $set: {
            'payment.paidAmount': newPaid,
            'payment.status': paymentStatus,
            'payment.method': input.method,
            modifiedAt: new Date(),
          },
          $push: {
            'payment.transactions': {
              amount: input.amount,
              method: input.method,
              note: input.note,
              recordedBy: input.recordedBy,
              paidAt: new Date(),
            },
          },
        },
      );

      return models.Orders.findOne({ _id });
    }

    public static async removeOrder(ids: string[]) {
      return models.Orders.deleteMany({ _id: { $in: ids } });
    }
  }

  orderSchema.loadClass(Order);
  return orderSchema;
};
