import * as Random from 'meteor-random';
import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

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

export interface IProductreview {
  productId: string;
  customerId: string;
  review: number;
}

export interface IProductreviewDocument extends IProductreview, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export const productreviewSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'ProductId' }),
  customerId: field({ type: String, label: 'CustomerId' }),
  review: field({ type: Number, label: 'Review' })
});

export interface IProductreviewModel extends Model<IProductreviewDocument> {
  createProductreview(doc: IProductreview): Promise<IProductreviewDocument>;
}

class Productreview {
  public static async createProductreview(doc) {
    const productreview = await Productreviews.create(doc);
    return productreview;
  }
  public static async updateProductreview(doc, productId) {
    const productreview = await Productreviews.update({ productId }, doc);
    return productreview;
  }
}

productreviewSchema.loadClass(Productreview);

const Productreviews = model<IProductreviewDocument, IProductreviewModel>(
  'productreviews',
  productreviewSchema
);

export { Productreviews };
