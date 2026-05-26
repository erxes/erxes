import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ISale, ISaleDocument } from '../../@types';
import { saleSchema } from '../definitions/sales';

export interface ISaleModel extends Model<ISaleDocument> {
  getSale(_id: string): Promise<ISaleDocument>;
  createSale(doc: ISale): Promise<ISaleDocument>;
  updateSale(_id: string, doc: ISale): Promise<ISaleDocument>;
  removeSales(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadSaleClass = (models: IModels, subdomain: string) => {
  class Sale {
    public static async getSale(_id: string) {
      const sale = await models.Sales.findOne({ _id });
      if (!sale) throw new Error('Sale not found');
      return sale;
    }

    public static async createSale(doc: ISale) {
      return models.Sales.create(doc);
    }

    public static async updateSale(_id: string, doc: ISale) {
      await models.Sales.updateOne({ _id }, { $set: doc });
      return models.Sales.getSale(_id);
    }

    public static async removeSales(_ids: string[]) {
      return models.Sales.deleteMany({ _id: { $in: _ids } });
    }
  }

  saleSchema.loadClass(Sale);
  return saleSchema;
};
