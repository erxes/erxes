import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { TimeDurationUnit, TIME_DURATION_UNITS } from '../../../consts';
import { ICpUser } from '../../../graphql';
import { LoginRequiredError } from '../../../customErrors';
import * as moment from 'moment';

export interface ISubscriptionOrder {
  _id: any;

  invoiceId?: string | null;
  invoiceAt?: Date | null;

  paymentConfirmed?: boolean | null;
  paymentConfirmedAt?: Date | null;

  unit: TimeDurationUnit;
  multiplier: number;

  price: number;

  cpUserId: string;
  createdAt: Date;
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
}

export const subscriptionOrderSchema = new Schema<SubscriptionOrderDocument>({
  invoiceId: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceAt: Date,

  paymentConfirmed: Boolean,
  paymentConfirmedAt: Date,

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
      const existing = await models.SubscriptionOrder.findOne({
        invoiceId,
        paymentConfirmed: true
      });

      if (existing) {
        if (existing._id.toString() === subscriptionOrderId.toString()) {
          throw new Error(`This order has already been completed`);
        } else {
          throw new Error(
            `This payment has been already used to complete another order`
          );
        }
      }

      const order = await models.SubscriptionOrder.findByIdOrThrow(
        subscriptionOrderId
      );
      order.invoiceId = invoiceId;
      await order.save();

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

      return true;
    }
  }
  subscriptionOrderSchema.loadClass(SubscriptionOrderModel);

  models.SubscriptionOrder = con.model<
    SubscriptionOrderDocument,
    ISubscriptionOrderModel
  >('forum_subscription_orders', subscriptionOrderSchema);
};
