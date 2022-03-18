import { Model, model } from 'mongoose';
import {
  formOrderSchema,
  IFormOrder,
  IFormOrderDocument
} from './definitions/formOrders';

export interface IFormOrderModel extends Model<IFormOrderDocument> {
  getOrder(_id: string): IFormOrderDocument;
  createOrder(doc: IFormOrder): IFormOrderDocument;
  updateOrder(_id: string, fields: IFormOrder): IFormOrderDocument;
  removeOrder(_id: string): IFormOrderDocument;
}

export const loadClass = () => {
  class FormOrder {
    public static async getOrder(doc: any) {
      const order = await FormOrders.findOne(doc);

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    }

    public static async createOrder(doc: IFormOrder) {
      return FormOrders.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateOrder(_id: string, fields: IFormOrder) {
      await FormOrders.updateOne({ _id }, { $set: { ...fields } });
      return FormOrders.findOne({ _id });
    }

    public static async removeOrder(_id) {
      const formOrder = await FormOrders.findOne({ _id });

      if (!formOrder) {
        throw new Error(`Order not found with id ${_id}`);
      }

      return formOrder.remove();
    }
  }

  formOrderSchema.loadClass(FormOrder);
};

loadClass();

// tslint:disable-next-line
const FormOrders = model<IFormOrderDocument, IFormOrderModel>(
  'form_orders',
  formOrderSchema
);

export default FormOrders;
