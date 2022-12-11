import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { TimeDurationUnit, TIME_DURATION_UNITS } from '../../../consts';
import { ICpUser } from '../../../graphql';
import { LoginRequiredError } from '../../../customErrors';
import * as moment from 'moment';
import {
  SubscriptionProductUserTypes,
  SUBSCRIPTION_PRODUCT_USER_TYPES
} from './subscriptionProduct';

export const SUBSCRIPTION_ORDER_STATES = [
  'PENDING',
  'SUCCESS',
  'FAILED'
] as const;
export type SubscriptionOrderState = typeof SUBSCRIPTION_ORDER_STATES[number];

export interface ISubscriptionOrder {
  _id: any;

  invoiceId?: string | null;

  unit: TimeDurationUnit;
  multiplier: number;

  price: number;

  userType: SubscriptionProductUserTypes;

  cpUserId: string;
  createdAt: Date;

  state: SubscriptionOrderState;
}

export type SubscriptionOrderDocument = ISubscriptionOrder & Document;

export interface ISubscriptionOrderModel
  extends Model<SubscriptionOrderDocument> {
  findByIdOrThrow(_id: string): Promise<SubscriptionOrderDocument>;

  cpFindByIdOwnOrThrow(
    _id: string,
    user?: ICpUser | null
  ): Promise<SubscriptionOrderDocument>;
  cpMyOrders(user?: ICpUser | null): Promise<SubscriptionOrderDocument[]>;
  cpCreateSubscriptionOrder(
    subscriptionProductId: string,
    user?: ICpUser | null
  ): Promise<SubscriptionOrderDocument>;

  cpCompleteSubscriptionOrder(
    subscriptionOrderId: string,
    invoiceId: string
  ): Promise<boolean>;

  cpFailSubscriptionOrder(
    subscriptionOrderId: string,
    cpUser?: ICpUser | null
  ): Promise<boolean>;
}

export const collectionName = 'forum_subscription_orders';
export const contentType = `forum:${collectionName}`;

export const subscriptionOrderSchema = new Schema<SubscriptionOrderDocument>({
  invoiceId: {
    type: String,
    unique: true,
    sparse: true
  },

  state: {
    type: String,
    required: true,
    enum: SUBSCRIPTION_ORDER_STATES,
    default: (): SubscriptionOrderState => 'PENDING'
  },

  unit: {
    type: String,
    required: true,
    enum: TIME_DURATION_UNITS
  },

  multiplier: {
    type: Number,
    required: true,
    min: 0
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  userType: {
    type: String,
    enum: SUBSCRIPTION_PRODUCT_USER_TYPES
  },

  cpUserId: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    required: true,
    default: () => new Date()
  }
});
subscriptionOrderSchema.index({ invoiceId: 1 }, { unique: true });

export const generateSubscriptionOrderModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class SubscriptionOrderModel {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<SubscriptionOrderDocument> {
      const doc = await models.SubscriptionOrder.findById(_id);
      if (!doc) {
        throw new Error('Subscription order not found');
      }
      return doc;
    }

    public static async cpFindByIdOwnOrThrow(
      _id: string,
      user?: ICpUser | null
    ): Promise<SubscriptionOrderDocument> {
      if (!user) throw new LoginRequiredError();

      const doc = await models.SubscriptionOrder.findByIdOrThrow(_id);
      if (doc.cpUserId !== user.userId)
        throw new Error('Subscription order not found');

      return doc;
    }

    public static async cpMyOrders(
      user?: ICpUser | null
    ): Promise<SubscriptionOrderDocument[]> {
      if (!user) throw new LoginRequiredError();

      const docs = await models.SubscriptionOrder.find({
        cpUserId: user.userId
      });

      return docs;
    }

    public static async cpCreateSubscriptionOrder(
      subscriptionProductId: string,
      user?: ICpUser | null
    ): Promise<SubscriptionOrderDocument> {
      if (!user) throw new LoginRequiredError();

      const product = await models.SubscriptionProduct.findByIdOrThrow(
        subscriptionProductId
      );

      if (product.userType && user.type && product.userType !== user.type) {
        throw new Error(
          `This product is for ${product.userType} users. Current user is ${user.type}`
        );
      }

      const doc = await models.SubscriptionOrder.create({
        unit: product.unit,
        multiplier: product.multiplier,
        price: product.price,
        cpUserId: user.userId
      });

      return doc;
    }

    public static async cpCompleteSubscriptionOrder(
      subscriptionOrderId: string,
      invoiceId: string
    ): Promise<boolean> {
      const completedOrder = await models.SubscriptionOrder.findOne({
        invoiceId,
        state: 'SUCCESS'
      });

      if (completedOrder) {
        if (completedOrder._id.toString() === subscriptionOrderId.toString()) {
          throw new Error(
            `This order has already been completed by this payment`
          );
        } else {
          throw new Error(
            `This payment has been already used to complete another order`
          );
        }
      }

      const order = await models.SubscriptionOrder.findByIdOrThrow(
        subscriptionOrderId
      );

      const user = await models.ForumClientPortalUser.findByIdOrCreate(
        order.cpUserId
      );
      const duration = moment.duration(order.multiplier, order.unit);

      const extendFrom = user.subscriptionEndsAfter
        ? moment(user.subscriptionEndsAfter)
        : moment();

      extendFrom.add(duration);

      user.subscriptionEndsAfter = extendFrom.toDate();
      await user.save();

      order.invoiceId = invoiceId;
      order.state = 'SUCCESS';
      await order.save();

      return true;
    }

    public static async cpFailSubscriptionOrder(
      subscriptionOrderId: string,
      cpUser?: ICpUser | null
    ): Promise<boolean> {
      if (!cpUser) throw new LoginRequiredError();

      const order = await models.SubscriptionOrder.findByIdOrThrow(
        subscriptionOrderId
      );

      if (order.cpUserId !== cpUser.userId)
        throw new Error('Subscription order not found');

      order.state = 'FAILED';
      await order.save();

      return true;
    }
  }
  subscriptionOrderSchema.loadClass(SubscriptionOrderModel);

  models.SubscriptionOrder = con.model<
    SubscriptionOrderDocument,
    ISubscriptionOrderModel
  >(collectionName, subscriptionOrderSchema);
};
