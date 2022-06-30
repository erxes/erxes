import { Model, model } from 'mongoose';
import { IOrder, IOrderDocument, orderSchema } from './definitions/orders';

export interface IOrderModel extends Model<IOrderDocument> {
  getOrder(_id: string): Promise<IOrderDocument>;
  createOrder(doc: IOrder): Promise<IOrderDocument>;
  updateOrder(_id: string, doc: IOrder): Promise<IOrderDocument>;
  deleteOrder(_id: string): Promise<{ n: number; ok: number }>;
  getPaidAmount(order: IOrderDocument): number;
}

export const loadOrderClass = models => {
  class Order {
    public static async getOrder(_id: string) {
      const order = await models.Orders.findOne({ _id }).lean();

      if (!order) {
        throw new Error(`Order not found with id: ${_id}`);
      }

      return order;
    }

    public static createOrder(doc: IOrder) {
      const now = new Date();
      return models.Orders.create({ ...doc, modifiedAt: now, createdAt: now });
    }

    public static async updateOrder(_id: string, doc: IOrder) {
      await models.Orders.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.Orders.findOne({ _id });
    }

    public static async deleteOrder(_id: string) {
      await models.Orders.getOrder(_id);

      return models.Orders.deleteOne({ _id });
    }

    public static getPaidAmount(order: IOrderDocument) {
      return (
        (order.cardAmount || 0) +
        (order.cashAmount || 0) +
        (order.mobileAmount || 0)
      );
    }
  }

  orderSchema.loadClass(Order);
  return orderSchema;
};

export const Orders = model<IOrderDocument, IOrderModel>('orders', orderSchema);
