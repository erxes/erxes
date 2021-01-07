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
  fingerPrint: string;
  integrationId?: string;
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
  createLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  updateLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  deleteVisitor(customerIds: string[]): Promise<{ n: number; ok: number }>;
  getVisitors(): Promise<IVisitorDocument[]>;
  getVisitor(fingerPrint: string): Promise<IVisitorDocument>;
}

export const schema = new Schema({
  integrationId: field({
    type: String,
    optional: true,
    label: 'Integration'
  }),
  remoteAddress: field({
    type: String,
    label: 'Remote address',
    optional: true,
    index: { unique: true }
  }),
  fingerPrint: field({
    type: String,
    label: 'Fingerprint ID',
    optional: true,
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
    optional: true
  }),
  sessionCount: field({
    type: Number,
    label: 'Session count',
    optional: true
  }),
  createdAt: field({ type: Date, default: Date.now })
});

export const loadLogClass = () => {
  class Visitor {
    public static async createLog(doc: IVistiorDoc) {
      const visitor = await Visitors.findOne({
        fingerPrint: doc.fingerPrint
      });

      if (visitor) {
        throw new Error('visitor already exists');
      }

      return Visitors.create({
        ...doc,
        sessionCount: 1,
        lastSeenAt: new Date()
      });
    }

    public static async updateLog(doc: IVistiorDoc) {
      const now = new Date();

      const visitor = await Visitors.findOne({
        fingerPrint: doc.fingerPrint
      });

      if (!visitor) {
        throw new Error('Visitor not found');
      }

      delete doc.integrationId;

      const query: any = {
        $set: {
          lastSeenAt: now,
          isOnline: true,
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
      await Visitors.findOneAndUpdate({ fingerPrint: doc.fingerPrint }, query);

      // updated customer
      return Visitors.findOne({ fingerPrint: doc.fingerPrint });
    }

    public static async getVisitor(fingerPrint: string) {
      return Visitors.findOne({ fingerPrint });
    }
  }

  schema.loadClass(Visitor);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const Visitors = model<IVisitorDocument, IVisitorModel>('visitors', schema);

export default Visitors;
