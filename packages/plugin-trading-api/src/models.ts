import * as Random from 'meteor-random';
import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

/*
 * Mongoose field options wrapper
 */
const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => Random.id();
  }

  return options;
};

export interface ITrading {
  name: string;
}

export interface ITradingDocument extends ITrading, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export const tradingSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' })
});

export interface ITradingModel extends Model<ITradingDocument> {
  createTrading(doc: ITrading): Promise<ITradingDocument>;
}

class Trading {
  public static async createTrading(doc) {
    const trading = await Tradings.create(doc);
    return trading;
  }
}

tradingSchema.loadClass(Trading);

const Tradings = model<ITradingDocument, ITradingModel>(
  'tradings',
  tradingSchema
);

export { Tradings };
