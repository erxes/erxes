import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IPosOrder, IPosOrderDocument } from '../../@types/orders';
import { posOrderSchema } from '../definitions/orders';
import { IModels } from '~/connectionResolvers';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export type IPosOrderUpsertInput = IPosOrder & {
  _id: string;
  scopeBrandIds?: string[];
};

export interface IPosOrderModel extends Model<IPosOrderDocument> {
  getOrder(_id: string): Promise<IPosOrderDocument>;
  createOrUpdate(document: IPosOrderUpsertInput): Promise<{
    oldOrder?: IPosOrderDocument;
    newOrder: IPosOrderDocument;
  }>;
  updateOrder(
    selector: FilterQuery<IPosOrderDocument>,
    document: UpdateQuery<IPosOrderDocument>,
  ): Promise<IPosOrderDocument>;
}

export const loadPosOrderClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class PosOrder {
    public static async getOrder(_id: string) {
      const order = await models.PosOrders.findOne({ _id }).lean();

      if (!order) {
        throw new Error(`Order not found with id: ${_id}`);
      }

      return order;
    }

    public static async createOrUpdate(document: IPosOrderUpsertInput) {
      const { _id, ...doc } = document;

      const oldOrder = await models.PosOrders.findOne({ _id }).lean();

      await models.PosOrders.updateOne(
        { _id },
        {
          $set: {
            ...doc,
          },
        },
        { upsert: true },
      );

      const newOrder = await models.PosOrders.findOne({ _id }).lean();
      if (!newOrder) {
        throw new Error(`Order not created`);
      }

      if (oldOrder?._id) {
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: { ...newOrder },
          prevDocument: oldOrder,
        });
      } else {
        sendDbEventLog({
          action: 'create',
          docId: _id,
          currentDocument: { ...newOrder },
        });
      }

      return { oldOrder: oldOrder || undefined, newOrder };
    }

    public static async updateOrder(
      selector: FilterQuery<IPosOrderDocument>,
      doc: UpdateQuery<IPosOrderDocument>,
    ) {
      const oldOrder = await models.PosOrders.findOne(selector).lean();
      if (!oldOrder) {
        throw new Error(`Order not found with id: ${selector}`);
      }

      await models.PosOrders.updateOne(
        { _id: oldOrder._id },
        {
          $set: {
            ...doc,
          },
        },
      );

      const newOrder = await models.PosOrders.findOne({
        _id: oldOrder._id,
      }).lean();
      if (!newOrder) {
        throw new Error(`Order not created`);
      }
      sendDbEventLog({
        action: 'update',
        docId: oldOrder._id,
        currentDocument: { ...newOrder },
        prevDocument: oldOrder,
      });

      return newOrder;
    }
  }

  posOrderSchema.loadClass(PosOrder);

  return posOrderSchema;
};
