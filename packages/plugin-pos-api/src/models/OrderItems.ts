import mongoose, { Model, model } from 'mongoose';
import {
  orderItemSchema,
  IOrderItemDocument,
  IOrderItem
} from './definitions/orderItems';

export interface IOrderItemModel extends Model<IOrderItemDocument> {
  getOrderItem(_id: string): Promise<IOrderItemDocument>;
  createOrderItem(doc: IOrderItem): Promise<IOrderItemDocument>;
  updateOrderItem(_id: string, doc: IOrderItem): Promise<IOrderItemDocument>;
  deleteOrderItem(_id: string): Promise<{ n: number; ok: number }>;
}

export const loadClass = () => {
  class OrderItem {
    public static async getOrderItem(_id: string) {
      const item = await OrderItems.findOne({ _id });

      if (!item) {
        throw new Error(`Order item not found with id: ${_id}`);
      }

      return item;
    }

    public static createOrderItem(doc: IOrderItem) {
      return OrderItems.create(doc);
    }

    public static updateOrderItem(_id: string, doc: IOrderItem) {
      return OrderItems.updateOne({ _id }, { $set: doc });
    }

    public static async deleteOrderItem(_id: string) {
      await OrderItems.getOrderItem(_id);

      return OrderItems.deleteOne({ _id });
    }
  }
  orderItemSchema.loadClass(OrderItem);
  return orderItemSchema;
};

loadClass();

delete mongoose.connection.models['order_items'];

export const OrderItems = model<IOrderItemDocument, IOrderItemModel>(
  'order_items',
  orderItemSchema
);
