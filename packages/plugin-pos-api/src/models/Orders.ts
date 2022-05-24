import mongoose, { Model, model } from 'mongoose';
import { IOrder, IOrderDocument, orderSchema } from './definitions/orders';

export interface IOrderModel extends Model<IOrderDocument> {
  getOrder(_id: string): Promise<IOrderDocument>;
  createOrder(doc: IOrder): Promise<IOrderDocument>;
  updateOrder(_id: string, doc: IOrder): Promise<IOrderDocument>;
  deleteOrder(_id: string): Promise<{ n: number; ok: number }>;
  getPaidAmount(order: IOrderDocument): number;
}

export const loadClass = () => {
  class Order {
    public static async getOrder(_id: string) {
      const order = await Orders.findOne({ _id });

      if (!order) {
        throw new Error(`Order not found with id: ${_id}`);
      }

      return order;
    }

    public static createOrder(doc: IOrder) {
      const now = new Date();
      return Orders.create({ ...doc, modifiedAt: now, createdAt: now });
    }

    public static async updateOrder(_id: string, doc: IOrder) {
      await Orders.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return Orders.findOne({ _id });
    }

    public static async deleteOrder(_id: string) {
      await Orders.getOrder(_id);

      return Orders.deleteOne({ _id });
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

loadClass();

delete mongoose.connection.models.orders;

export const Orders = model<IOrderDocument, IOrderModel>('orders', orderSchema);
