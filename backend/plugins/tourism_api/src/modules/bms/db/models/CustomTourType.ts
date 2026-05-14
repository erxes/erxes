import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ICustomTourType,
  ICustomTourTypeDocument,
} from '@/bms/@types/customTourType';
import { customTourTypeSchema } from '@/bms/db/definitions/customTourType';
import { generateUniqueSlug } from '@/bms/utils/customFields';

export interface ICustomTourTypeModel extends Model<ICustomTourTypeDocument> {
  getCustomTourType(_id: string): Promise<ICustomTourTypeDocument>;
  createCustomTourType(doc: ICustomTourType): Promise<ICustomTourTypeDocument>;
  updateCustomTourType(
    _id: string,
    doc: ICustomTourType,
  ): Promise<ICustomTourTypeDocument>;
  removeCustomTourType(_id: string): Promise<any>;
}

export const loadCustomTourTypeClass = (models: IModels) => {
  class CustomTourType {
    private static async isCodeValid(
      code: string,
      branchId: string,
      excludeId?: string,
    ) {
      const exists = await models.CustomTourTypes.countDocuments({
        code,
        branchId,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      });

      if (exists > 0) {
        throw new Error('Custom tour type code already exists');
      }

      if (!/^[a-zA-Z0-9_]+$/.test(code)) {
        throw new Error('Custom tour type code has invalid characters');
      }

      return true;
    }

    public static async getCustomTourType(_id: string) {
      const customTourType = await models.CustomTourTypes.findOne({ _id });

      if (!customTourType) {
        throw new Error('Custom tour type not found');
      }

      return customTourType;
    }

    public static async createCustomTourType(doc: ICustomTourType) {
      if (doc.code) {
        const uniqueCode = await generateUniqueSlug(
          models.CustomTourTypes,
          doc.branchId,
          'code',
          doc.code,
        );

        doc.code = uniqueCode;
      }

      doc.name = await generateUniqueSlug(
        models.CustomTourTypes,
        doc.branchId,
        'name',
        doc.label,
      );

      await this.isCodeValid(doc.code, doc.branchId);

      return models.CustomTourTypes.create(doc);
    }

    public static async updateCustomTourType(
      _id: string,
      doc: ICustomTourType,
    ) {
      const existingType = await models.CustomTourTypes.findOne({ _id });

      if (!existingType) {
        throw new Error('Custom tour type not found');
      }

      const branchId = doc.branchId || existingType.branchId;

      if (doc.code && doc.code !== existingType.code) {
        const uniqueCode = await generateUniqueSlug(
          models.CustomTourTypes,
          branchId,
          'code',
          doc.code,
        );
        doc.code = uniqueCode;
      }

      await this.isCodeValid(doc.code || existingType.code, branchId, _id);

      const customTourType = await models.CustomTourTypes.findOneAndUpdate(
        { _id },
        { $set: { ...doc, branchId } },
        { new: true },
      );

      if (!customTourType) {
        throw new Error('Custom tour type not found');
      }

      return customTourType;
    }

    public static async removeCustomTourType(_id: string) {
      const customTourType = await models.CustomTourTypes.findOne({ _id });

      if (!customTourType) {
        throw new Error('Custom tour type not found');
      }

      const toursCount = await models.Tours.countDocuments({
        customTourTypeId: _id,
      });

      if (toursCount > 0) {
        throw new Error(
          'Cannot delete custom tour type that is being used by tours',
        );
      }

      await models.CustomTourTypes.deleteOne({ _id });
      return { success: true };
    }
  }

  customTourTypeSchema.loadClass(CustomTourType);

  return customTourTypeSchema;
};
