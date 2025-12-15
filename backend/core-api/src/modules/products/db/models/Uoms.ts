import { IUom, IUomDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { PRODUCT_STATUSES } from '../../constants';
import { uomSchema } from '../definitions/uoms';
export interface IUomModel extends Model<IUomDocument> {
  getUom(selector: any): Promise<IUomDocument>;
  createUom(doc: IUom): Promise<IUomDocument>;
  updateUom(_id: string, doc: IUom): Promise<IUomDocument>;
  removeUoms(_ids: string[]): Promise<{ n: number; ok: number }>;
  checkUOM(doc: { uom?: string; subUoms?: any[] });
}

export const loadUomClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Uom {
    /**
     * Get Uom
     */
    public static async getUom(selector: any) {
      const uom = await models.Uoms.findOne(selector);

      if (!uom) {
        throw new Error('Unit of measurement not found');
      }

      return uom;
    }

    /**
     * Create a uom
     */
    public static async createUom(doc: IUom) {
      await this.checkCodeDuplication(doc.code);
      const uom = await models.Uoms.create(doc);
      sendDbEventLog({
        action: 'create',
        docId: uom._id,
        currentDocument: uom.toObject(),
      });
      return uom;
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

      const updatedUom = await models.Uoms.findOne({ _id });
      if (updatedUom) {
        sendDbEventLog({
          action: 'update',
          docId: updatedUom._id,
          currentDocument: updatedUom.toObject(),
          prevDocument: uom.toObject(),
        });
      }
      return updatedUom;
    }

    /**
     * Remove uoms
     */
    public static async removeUoms(_ids: string[]) {
      const uoms = await models.Uoms.find({
        uom: { $in: _ids },
      }).lean();
      const uomIds = uoms.map((p) => p._id);

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
        const toUpdate = await models.Uoms.find({ _id: { $in: usedIds } });
        await models.Uoms.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: PRODUCT_STATUSES.DELETED },
          },
        );
        const updated = await models.Uoms.find({ _id: { $in: usedIds } });
        sendDbEventLog({
          action: 'updateMany',
          docIds: updated.map((d) => d._id),
          updateDescription: { status: PRODUCT_STATUSES.DELETED },
        });
        response = 'updated';
      }

      if (unUsedIds.length > 0) {
        const toDelete = await models.Uoms.find({ _id: { $in: unUsedIds } });
        await models.Uoms.deleteMany({ _id: { $in: unUsedIds } });
        if (toDelete.length > 0) {
          sendDbEventLog({
            action: 'deleteMany',
            docIds: toDelete.map((d) => d._id),
          });
        }
      }

      return response;
    }

    /**
     * Check uoms
     */
    static async checkUOM(doc) {
      if (!doc.uom) {
        throw new Error('uom is required');
      }

      const uoms = (doc.subUoms || []).map((u) => u.uom);
      uoms.unshift(doc.uom);
      const oldUoms = await models.Uoms.find({ code: { $in: uoms } }).lean();
      const oldUomCodes = (oldUoms || []).map((u) => u.code);
      const creatUoms: any[] = [];

      for (const uom of uoms) {
        if (!oldUomCodes.includes(uom)) {
          creatUoms.push({ code: uom, name: uom });
        }
      }

      const inserted = await models.Uoms.insertMany(creatUoms);
      if (inserted.length > 0) {
        sendDbEventLog({
          action: 'create',
          docId: inserted.map((r) => r._id),
          currentDocument: inserted.map((r) => r.toObject()),
        });
      }

      return doc.uom;
    }

    /**
     * Check uom duplication
     */
    static async checkCodeDuplication(code: string) {
      const uom = await models.Uoms.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      });

      if (uom) {
        throw new Error('Code must be unique');
      }
    }
  }

  uomSchema.loadClass(Uom);

  return uomSchema;
};
