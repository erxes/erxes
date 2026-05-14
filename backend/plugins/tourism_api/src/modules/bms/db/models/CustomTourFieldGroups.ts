import { Model } from 'mongoose';
import {
  ICustomTourFieldGroup,
  ICustomTourFieldGroupDocument,
} from '@/bms/@types/customTourType';
import { IModels } from '~/connectionResolvers';
import { customTourFieldGroupSchema } from '@/bms/db/definitions/customTourType';
import { generateUniqueSlug } from '@/bms/utils/customFields';

function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

async function generateUniqueSlugForUpdate(params: {
  model: ICustomTourFieldGroupModel;
  branchId: string;
  field: string;
  baseSlug: string;
  excludeId: string;
  count?: number;
}): Promise<string> {
  const { model, branchId, field, baseSlug, excludeId } = params;
  const count = params.count ?? 1;
  const MAX_ATTEMPTS = 1000;

  if (count > MAX_ATTEMPTS) {
    throw new Error(
      `Unable to generate unique slug after ${MAX_ATTEMPTS} attempts`,
    );
  }

  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}_${count}`;

  const existing = await model.findOne({
    [field]: potentialSlug,
    branchId,
    _id: { $ne: excludeId },
  });

  if (!existing) {
    return potentialSlug;
  }

  return generateUniqueSlugForUpdate({
    model,
    branchId,
    field,
    baseSlug,
    excludeId,
    count: count + 1,
  });
}

export interface ICustomTourFieldGroupModel
  extends Model<ICustomTourFieldGroupDocument> {
  getCustomTourFieldGroups: (
    query: any,
  ) => Promise<ICustomTourFieldGroupDocument[]>;
  createFieldGroup: (
    data: ICustomTourFieldGroup,
  ) => Promise<ICustomTourFieldGroupDocument>;
  updateFieldGroup: (
    id: string,
    data: ICustomTourFieldGroup,
  ) => Promise<ICustomTourFieldGroupDocument>;
  deleteFieldGroup: (id: string) => Promise<ICustomTourFieldGroupDocument>;
  toggleStatus: (id: string) => Promise<ICustomTourFieldGroupDocument>;
}

export const loadCustomTourFieldGroupClass = (models: IModels) => {
  class CustomTourFieldGroups {
    public static createFieldGroup = async (data: ICustomTourFieldGroup) => {
      if (data.code) {
        const uniqueCode = await generateUniqueSlug(
          models.CustomTourFieldGroups,
          data.branchId,
          'code',
          data.code,
        );
        data.code = uniqueCode;
      }
      const count = await models.CustomTourFieldGroups.countDocuments({
        branchId: data.branchId,
        label: data.label,
      });
      if (count > 0) {
        data.label = `${data.label} (${count + 1})`;
      }
      return await models.CustomTourFieldGroups.create(data);
    };

    public static updateFieldGroup = async (
      id: string,
      data: ICustomTourFieldGroup,
    ) => {
      const existingGroup = await models.CustomTourFieldGroups.findById(id);

      if (!existingGroup) {
        throw new Error('Tour field group not found');
      }

      const branchId = data.branchId || existingGroup.branchId;

      if (data.code && data.code !== existingGroup.code) {
        data.code = await generateUniqueSlugForUpdate({
          model: models.CustomTourFieldGroups,
          branchId,
          field: 'code',
          baseSlug: data.code,
          excludeId: id,
        });
      }

      const updateData: Partial<ICustomTourFieldGroup> = omitUndefined({
        ...data,
        branchId,
      });

      if (!('fields' in data)) {
        updateData.fields = existingGroup.fields;
      }

      return models.CustomTourFieldGroups.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true },
      );
    };

    public static deleteFieldGroup = async (id: string) => {
      return await models.CustomTourFieldGroups.findOneAndDelete({ _id: id });
    };

    public static getCustomTourFieldGroups = async (query: any) => {
      return await models.CustomTourFieldGroups.find(query)
        .sort({ name: 1 })
        .lean();
    };
  }
  customTourFieldGroupSchema.loadClass(CustomTourFieldGroups);

  return customTourFieldGroupSchema;
};
