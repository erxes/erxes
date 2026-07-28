import { IProduct, IUom, IUomDocument } from 'erxes-api-shared/core-types';
import { FilterQuery, Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { PRODUCT_STATUSES } from '../../constants';
import { uomSchema } from '../definitions/uoms';

type ICheckUomInput = Pick<IProduct, 'uom' | 'subUoms'>;

export interface IUomModel extends Model<IUomDocument> {
  getUom(selector: FilterQuery<IUomDocument>): Promise<IUomDocument>;
  createUom(doc: IUom): Promise<IUomDocument>;
  updateUom(_id: string, doc: IUom): Promise<IUomDocument>;
  removeUoms(_ids: string[]): Promise<{ n: number; ok: number }>;
  checkUOM(doc: ICheckUomInput): Promise<string>;
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
    public static async getUom(selector: FilterQuery<IUomDocument>) {
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
     *
     * A UOM can be referenced by different values depending on the caller:
     * imports use the code, the product form sends the name and configs send
     * the _id. Match on all of them so an existing UOM is never recreated as a
     * duplicate, and only insert UOMs that are genuinely new.
     */
    static async checkUOM(doc: ICheckUomInput): Promise<string> {
      if (!doc.uom) {
        throw new Error('uom is required');
      }
      const mainUom = doc.uom;

      const uoms = (doc.subUoms || [])
        .map((subUom) => subUom.uom)
        .filter(Boolean);
      uoms.unshift(mainUom);

      const existingUoms = await models.Uoms.find({
        $or: [
          { code: { $in: uoms } },
          { name: { $in: uoms } },
          { _id: { $in: uoms } },
        ],
      }).lean();

      // Map every known representation (code/name/_id) of an existing UOM to
      // its canonical code, so the stored value is always the code.
      const valueToCode = new Map<string, string>();
      for (const uom of existingUoms || []) {
        if (uom.code) valueToCode.set(uom.code, uom.code);
        if (uom.name) valueToCode.set(uom.name, uom.code);
        valueToCode.set(String(uom._id), uom.code);
      }

      const creatUoms: Array<{ code: string; name: string }> = [];
      for (const uom of uoms) {
        if (!valueToCode.has(uom)) {
          creatUoms.push({ code: uom, name: uom });
          valueToCode.set(uom, uom);
        }
      }

      if (creatUoms.length > 0) {
        const inserted = await models.Uoms.insertMany(creatUoms);
        if (inserted.length > 0) {
          sendDbEventLog({
            action: 'bulkWrite',
            docIds: inserted.map((r) => r._id),
            updateDescription: {
              newUoms: creatUoms,
            },
          });
        }
      }

      // Normalize subUoms to the canonical code as well, so they are never
      // stored as an _id (or name).
      if (Array.isArray(doc.subUoms)) {
        doc.subUoms = doc.subUoms.map((subUom) => ({
          ...subUom,
          uom: subUom.uom
            ? (valueToCode.get(subUom.uom) ?? subUom.uom)
            : subUom.uom,
        }));
      }

      // Always return the canonical code representation of the main uom.
      return valueToCode.get(mainUom) ?? mainUom;
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
