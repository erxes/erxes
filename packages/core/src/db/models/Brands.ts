import * as Random from 'meteor-random';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import { brandSchema, IBrand, IBrandDocument } from './definitions/brands';

export interface IBrandModel extends Model<IBrandDocument> {
  getBrand(doc: any): IBrandDocument;
  getBrandByCode(code: string): IBrandDocument;
  generateCode(code: string): string;
  createBrand(doc: IBrand): IBrandDocument;
  updateBrand(_id: string, fields: IBrand): IBrandDocument;
  removeBrand(_id: string): IBrandDocument;
}

export const loadBrandClass = (models: IModels) => {
  class Brand {
    /*
     * Get a Brand
     */
    public static async getBrand(doc: any) {
      const brand = await models.Brands.findOne(doc).lean();

      if (!brand) {
        throw new Error('Brand not found');
      }

      return brand;
    }

    public static async generateCode(code?: string) {
      let generatedCode = code || Random.id().substr(0, 6);

      let prevBrand = await models.Brands.findOne({ code: generatedCode });

      // search until not existing one found
      while (prevBrand) {
        generatedCode = Random.id().substr(0, 6);

        prevBrand = await models.Brands.findOne({ code: generatedCode });
      }

      return generatedCode;
    }

    public static async createBrand(doc: IBrand) {
      // generate code automatically
      // if there is no brand code defined
      return models.Brands.create({
        ...doc,
        code: await this.generateCode(),
        createdAt: new Date(),
        emailConfig:
          Object.keys(doc.emailConfig || {}).length > 0
            ? doc.emailConfig
            : { type: 'simple' }
      });
    }

    public static async updateBrand(_id: string, fields: IBrand) {
      await models.Brands.updateOne({ _id }, { $set: { ...fields } });
      return models.Brands.findOne({ _id });
    }

    public static async removeBrand(_id) {
      const brandObj = await models.Brands.findOne({ _id });

      if (!brandObj) {
        throw new Error(`Brand not found with id ${_id}`);
      }

      return brandObj.remove();
    }
  }

  brandSchema.loadClass(Brand);

  return brandSchema;
};
