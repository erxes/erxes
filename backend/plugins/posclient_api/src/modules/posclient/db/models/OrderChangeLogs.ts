import { Model } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import { orderChangeLogSchema } from '../definitions/orderChangeLogs';
import {
  IOrderChangeLog,
  IOrderChangeLogDocument,
  ICartChangeLogInput,
} from '@/posclient/@types/orderChangeLogs';

export interface IOrderChangeLogModel extends Model<IOrderChangeLogDocument> {
  createLog(doc: IOrderChangeLog): Promise<IOrderChangeLogDocument>;
  recordCartChange(
    doc: ICartChangeLogInput,
    posToken: string,
    userId: string,
  ): Promise<IOrderChangeLogDocument>;
}

export const loadOrderChangeLogClass = (models: IModels) => {
  class OrderChangeLog {
    public static createLog(doc: IOrderChangeLog) {
      const now = new Date();
      return models.OrderChangeLogs.create({
        ...doc,
        occurredAt: doc.occurredAt || now,
        createdAt: now,
      });
    }

    public static async recordCartChange(
      doc: ICartChangeLogInput,
      posToken: string,
      userId: string,
    ) {
      if (doc.actorId !== userId) {
        throw new Error('Cart action must be submitted by its acting user');
      }
      if (
        !doc.eventId ||
        !doc.cartId ||
        doc.eventId.length > 100 ||
        doc.cartId.length > 100
      ) {
        throw new Error('Valid cart and event IDs are required');
      }
      if (Buffer.byteLength(JSON.stringify(doc), 'utf8') > 512 * 1024) {
        throw new Error('Cart audit snapshot is too large');
      }
      const occurredAt = new Date(doc.occurredAt);
      if (
        !Number.isFinite(occurredAt.valueOf()) ||
        occurredAt.valueOf() > Date.now() + 300000
      ) {
        throw new Error('Invalid cart action time');
      }
      for (const items of [doc.beforeItems, doc.afterItems]) {
        if (
          items.length > 500 ||
          new Set(items.map((item) => item._id)).size !== items.length ||
          items.some(
            (item) =>
              !item._id ||
              !item.productId ||
              !Number.isFinite(item.count) ||
              item.count < 0 ||
              !Number.isFinite(item.unitPrice),
          )
        ) {
          throw new Error('Invalid cart item snapshot');
        }
      }
      if (doc.orderId) {
        const order = await models.Orders.findOne({ _id: doc.orderId }).lean();
        if (
          order &&
          order.posToken !== posToken &&
          order.subToken !== posToken
        ) {
          throw new Error('Order does not belong to this POS');
        }
      }
      const itemActions = doc.beforeItems.flatMap((item) => {
        const after = doc.afterItems.find((next) => next._id === item._id);
        if (
          after &&
          (after.productId !== item.productId || after.count > item.count)
        ) {
          throw new Error(
            'Cart audit only accepts removals and quantity reductions',
          );
        }
        return !after || after.count < item.count
          ? [
              {
                itemId: item._id,
                productId: item.productId,
                productName: item.productName,
                action: after ? 'decreased' : 'removed',
                beforeCount: item.count,
                afterCount: after?.count ?? 0,
              },
            ]
          : [];
      });
      if (
        !itemActions.length ||
        doc.afterItems.some(
          (item) => !doc.beforeItems.some((before) => before._id === item._id),
        )
      ) {
        throw new Error(
          'Cart action must remove an item or reduce its quantity',
        );
      }
      const now = new Date();
      return models.OrderChangeLogs.findOneAndUpdate(
        { posToken, eventId: doc.eventId, userId },
        {
          $setOnInsert: {
            orderId: doc.orderId,
            cartId: doc.cartId,
            eventId: doc.eventId,
            source: 'cart',
            posToken,
            userId,
            occurredAt,
            createdAt: now,
            changes: [
              {
                field: 'items',
                oldValue: doc.beforeItems,
                newValue: doc.afterItems,
              },
              { field: 'itemActions', oldValue: null, newValue: itemActions },
            ],
          },
        },
        { upsert: true, new: true },
      ).orFail();
    }
  }

  orderChangeLogSchema.loadClass(OrderChangeLog);
  return orderChangeLogSchema;
};
