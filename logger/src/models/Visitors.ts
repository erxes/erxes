import { Document, model, Model, Schema } from 'mongoose';
import { field } from './Logs';

export interface ILocation {
  remoteAddress: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
}

export interface ILocationDocument extends ILocation, Document {}

export interface IVistiorDoc {
  visitorId: string;
  integrationId?: string;
  location?: ILocationDocument;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
}

export const locationSchema = new Schema(
  {
    remoteAddress: field({
      type: String,
      label: 'Remote address',
      optional: true
    }),
    country: field({ type: String, label: 'Country', optional: true }),
    countryCode: field({ type: String, label: 'Country code', optional: true }),
    city: field({ type: String, label: 'City', optional: true }),
    region: field({ type: String, label: 'Region', optional: true }),
    hostname: field({ type: String, label: 'Host name', optional: true }),
    language: field({ type: String, label: 'Language', optional: true }),
    userAgent: field({ type: String, label: 'User agent', optional: true })
  },
  { _id: false }
);

export interface IVisitorDocument extends IVistiorDoc, Document {}

export interface IVisitorModel extends Model<IVisitorDocument> {
  createOrUpdateVisitorLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  updateVisitorLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  removeVisitorLog(visitorId: string): void;
  getVisitorLog(visitorId: string): Promise<IVisitorDocument>;
}

export const schema = new Schema({
  integrationId: field({
    type: String,
    optional: true,
    label: 'Integration'
  }),
  visitorId: field({
    type: String,
    label: 'visitorId from finger print',
    optional: true,
    index: { unique: true }
  }),

  location: field({
    type: locationSchema,
    optional: true,
    label: 'Location'
  }),

  isOnline: field({
    type: Boolean,
    label: 'Is online',
    optional: true
  }),
  lastSeenAt: field({
    type: Date,
    label: 'Last seen at',
    optional: true
  }),
  sessionCount: field({
    type: Number,
    label: 'Session count',
    optional: true
  }),
  createdAt: field({ type: Date, default: Date.now })
});

export const loadVisitorClass = () => {
  class Visitor {
    public static async createOrUpdateVisitorLog(doc: IVistiorDoc) {
      const visitor = await Visitors.findOne({ visitorId: doc.visitorId });

      if (visitor) {
        return Visitors.findOneAndUpdate({ visitorId: doc.visitorId }, doc);
      }

      return Visitors.create({
        ...doc,
        sessionCount: 1,
        lastSeenAt: new Date()
      });
    }

    public static async updateVisitorLog(doc: IVistiorDoc) {
      const now = new Date();

      const visitor = await Visitors.getVisitorLog(doc.visitorId);

      // log & quietly return instead of throwing an error
      if (!visitor) {
        // tslint:disable-next-line
        console.log(
          `Visitor with Id ${doc.visitorId} not found while trying to update visitor.`
        );

        return;
      }

      delete doc.integrationId;

      const query: any = {
        $set: {
          lastSeenAt: now,
          ...doc
        }
      };

      // Preventing session count to increase on page every refresh
      // Close your web site tab and reopen it after 6 seconds then it will increase
      // session count by 1
      if (
        visitor.lastSeenAt &&
        now.getTime() - visitor.lastSeenAt.getTime() > 6 * 1000
      ) {
        // update session count
        query.$inc = { sessionCount: 1 };
      }

      // update
      await Visitors.findOneAndUpdate({ visitorId: doc.visitorId }, query);

      // updated customer
      return Visitors.findOne({ visitorId: doc.visitorId });
    }

    public static getVisitorLog(visitorId: string) {
      return Visitors.findOne({ visitorId });
    }

    public static removeVisitorLog(visitorId: string) {
      return Visitors.deleteOne({ visitorId });
    }
  }

  schema.loadClass(Visitor);

  return schema;
};

loadVisitorClass();

// tslint:disable-next-line
const Visitors = model<IVisitorDocument, IVisitorModel>('visitors', schema);

export default Visitors;
