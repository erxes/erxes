import { brandSchema } from '@/organization/brand/db/definitions/brands';
import { IBrand, IBrandDocument } from '@/organization/brand/types';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';

export interface IBrandModel extends Model<IBrandDocument> {
  getBrand(doc: any): Promise<IBrandDocument>;
  generateCode(code: string): Promise<string>;
  createBrand(doc: IBrand): Promise<IBrandDocument>;
  updateBrand(_id: string, fields: IBrand): Promise<IBrandDocument>;
  removeBrands(_ids: string[]): Promise<{ n: number; ok: number }>;
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
      let generatedCode = code || nanoid(6);

      let prevBrand = await models.Brands.findOne({ code: generatedCode });

      // search until not existing one found
      while (prevBrand) {
        generatedCode = nanoid(6);

        prevBrand = await models.Brands.findOne({ code: generatedCode });
      }

      return generatedCode;
    }

    public static async createBrand(doc: IBrand) {
      // generate code automatically
      // if there is no brand code defined

      let code = doc.code;

      if (code) {
        const exists = await models.Brands.findOne({ code });
        if (exists) {
          throw new Error('Code already exists');
        }
      } else {
        code = await this.generateCode();
      }

      return models.Brands.create({
        ...doc,
        code,
        emailConfig:
          Object.keys(doc.emailConfig || {}).length > 0
            ? doc.emailConfig
            : { type: 'simple' },
      });
    }

    public static async updateBrand(_id: string, fields: IBrand) {
      return models.Brands.findOneAndUpdate(
        { _id },
        { $set: { ...fields } },
        { new: true },
      );
    }

    public static async removeBrands(_ids: string[]) {
      return await models.Brands.deleteMany({ _id: _ids });
    }
  }

  brandSchema.loadClass(Brand);

  return brandSchema;
};
