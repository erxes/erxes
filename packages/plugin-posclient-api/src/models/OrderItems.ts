import { Model, model } from 'mongoose';
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

export const loadOrderItemClass = models => {
  class OrderItem {
    public static async getOrderItem(_id: string) {
      const item = await models.OrderItems.findOne({ _id }).lean();

      if (!item) {
        throw new Error(`Order item not found with id: ${_id}`);
      }

      return item;
    }

    public static createOrderItem(doc: IOrderItem) {
      return models.OrderItems.create(doc);
    }

    public static updateOrderItem(_id: string, doc: IOrderItem) {
      return models.OrderItems.updateOne({ _id }, { $set: doc }).lean();
    }

    public static async deleteOrderItem(_id: string) {
      await models.OrderItems.getOrderItem(_id);

      return models.OrderItems.deleteOne({ _id });
    }
  }
  orderItemSchema.loadClass(OrderItem);
  return orderItemSchema;
};
