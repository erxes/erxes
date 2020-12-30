import { Document, model, Model, Schema } from 'mongoose';

/**
 * Mongoose field options wrapper
 * @param {Object} options Mongoose schema options
 */
export const field = options => {
  const { type, optional } = options;

  if (type === String && !optional) {
    options.validate = /\S+/;
  }

  return options;
};

export interface IVistiorDoc {
  relatedIntegrationIds?: string[];
  integrationId?: string;
  tagIds?: string[];
  remoteAddress: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
  deviceTokens?: string[];
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
}

export interface IVisitorDocument extends IVistiorDoc, Document {}

export interface IVisitorModel extends Model<IVisitorDocument> {
  createOrUpdate(doc: IVistiorDoc): Promise<IVisitorDocument>;
  deleteVisitor(customerIds: string[]): Promise<{ n: number; ok: number }>;
  getVisitors(): Promise<IVisitorDocument[]>;
  getVisitor(ipAddress: string): Promise<IVisitorDocument>;
}

export const schema = new Schema({
  relatedIntegrationIds: field({ type: [String], optional: true }),
  integrationId: field({
    type: String,
    optional: true,
    label: 'Integration',
    esType: 'keyword'
  }),
  tagIds: field({
    type: [String],
    optional: true,
    index: true,
    label: 'Tags'
  }),

  remoteAddress: field({
    type: String,
    label: 'Remote address',
    required: true,
    index: { unique: true }
  }),
  country: field({ type: String, label: 'Country', optional: true }),
  countryCode: field({ type: String, label: 'Country code', optional: true }),
  city: field({ type: String, label: 'City', optional: true }),
  region: field({ type: String, label: 'Region', optional: true }),
  hostname: field({ type: String, label: 'Host name', optional: true }),
  language: field({ type: String, label: 'Language', optional: true }),
  userAgent: field({ type: String, label: 'User agent', optional: true }),

  deviceTokens: field({ type: [String], default: [] }),
  isOnline: field({
    type: Boolean,
    label: 'Is online',
    optional: true
  }),
  lastSeenAt: field({
    type: Date,
    label: 'Last seen at',
    optional: true,
    esType: 'date'
  }),
  sessionCount: field({
    type: Number,
    label: 'Session count',
    optional: true,
    esType: 'number'
  })
});

export const loadLogClass = () => {
  class Visitor {
    public static async createOrUpdate(doc: IVistiorDoc) {
      const now = new Date();

      const visitor = await Visitors.findOne({
        remoteAddress: doc.remoteAddress
      });

      if (!visitor) {
        return Visitors.create({
          ...doc,
          sessionCount: 1,
          lastSeenAt: new Date()
        });
      }

      const query: any = {
        $set: {
          lastSeenAt: now,
          isOnline: true
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
      await Visitors.findOneAndUpdate(
        { remoteAddress: doc.remoteAddress },
        query
      );

      // updated customer
      return Visitors.findOne({ remoteAddress: doc.remoteAddress });
    }
  }

  schema.loadClass(Visitor);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const Visitors = model<IVisitorDocument, IVisitorModel>('visitors', schema);

export default Visitors;
