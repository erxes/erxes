import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { PRODUCT_STATUSES } from './definitions/products';
import { IUom, IUomDocument, uomSchema } from './definitions/uoms';

export interface IUomModel extends Model<IUomDocument> {
  getUom(selector: any): Promise<IUomDocument>;
  createUom(doc: IUom): Promise<IUomDocument>;
  updateUom(_id: string, doc: IUom): Promise<IUomDocument>;
  removeUoms(_ids: string[]): Promise<{ n: number; ok: number }>;
  checkUOM(doc: { uom?: string; subUoms?: any[] });
}

export const loadUomClass = (models: IModels, subdomain: string) => {
  class Uom {
    /**
     *
     * Get Uom Cagegory
     */

    public static async getUom(selector: any) {
      const uom = await models.Uoms.findOne(selector);

      if (!uom) {
        throw new Error('Unit of measurement not found');
      }

      return uom;
    }

    static async checkCodeDuplication(code: string) {
      const uom = await models.Uoms.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });

      if (uom) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a uom
     */
    public static async createUom(doc: IUom) {
      await this.checkCodeDuplication(doc.code);
      return models.Uoms.create(doc);
    }

    /**
     * Update Product
     */
    public static async updateUom(_id: string, doc: IUom) {
      const uom = await models.Uoms.getUom({ _id });

      if (uom.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await models.Uoms.updateOne({ _id }, { $set: doc });

      return models.Uoms.findOne({ _id });
    }

    static async checkUOM(doc) {
      if (!doc.uom) {
        throw new Error('uom is required');
      }

      const uoms = (doc.subUoms || []).map(u => u.uom);
      uoms.unshift(doc.uom);
      const oldUoms = await models.Uoms.find({ code: { $in: uoms } }).lean();
      const oldUomCodes = (oldUoms || []).map(u => u.code);
      const creatUoms: any[] = [];

      for (const uom of uoms) {
        if (!oldUomCodes.includes(uom)) {
          creatUoms.push({ code: uom, name: uom });
        }
      }

      await models.Uoms.insertMany(creatUoms);

      return doc.uom;
    }

    /**
     * Remove uoms
     */
    public static async removeUoms(_ids: string[]) {
      const uoms = await models.Uoms.find({
        uom: { $in: _ids }
      }).lean();
      const uomIds = uoms.map(p => p._id);

      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      for (const id of _ids) {
        if (!uomIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await models.Uoms.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: PRODUCT_STATUSES.DELETED }
          }
        );
        response = 'updated';
      }

      await models.Uoms.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }
  }

  uomSchema.loadClass(Uom);

  return uomSchema;
};
