import { Model } from 'mongoose';
import slugify from 'slugify';

import {
  ICustomFieldGroup,
  ICustomFieldGroupDocument,
} from '@/cms/@types/customPostType';
import { IModels } from '~/connectionResolvers';
import { fieldGroupSchema } from '@/cms/db/definitions/customPostType';
import { generateUniqueSlug } from '@/cms/utils/common';

function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

async function generateUniqueSlugForUpdate(params: {
  model: ICustomFieldGroupModel;
  clientPortalId: string;
  field: string;
  baseSlug: string;
  excludeId: string;
  count?: number;
}): Promise<string> {
  const { model, clientPortalId, field, baseSlug, excludeId } = params;
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
    clientPortalId,
    _id: { $ne: excludeId },
  });

  if (!existing) {
    return potentialSlug;
  }

  return generateUniqueSlugForUpdate({
    model,
    clientPortalId,
    field,
    baseSlug,
    excludeId,
    count: count + 1,
  });
}

export interface ICustomFieldGroupModel extends Model<ICustomFieldGroupDocument> {
  getCustomFieldGroups: (query: any) => Promise<ICustomFieldGroupDocument[]>;
  createFieldGroup: (
    data: ICustomFieldGroup,
  ) => Promise<ICustomFieldGroupDocument>;
  updateFieldGroup: (
    id: string,
    data: ICustomFieldGroup,
  ) => Promise<ICustomFieldGroupDocument>;
  deleteFieldGroup: (id: string) => Promise<ICustomFieldGroupDocument>;
  toggleStatus: (id: string) => Promise<ICustomFieldGroupDocument>;
}

const buildFieldGroupCode = (code?: string, label?: string) => {
  const source = code?.trim() || label?.trim() || 'field_group';

  return slugify(source, {
    lower: true,
    replacement: '_',
    strict: true,
    trim: true,
  });
};

export const loadCustomFieldGroupClass = (models: IModels) => {
  class CustomFieldGroups {
    public static createFieldGroup = async (data: ICustomFieldGroup) => {
      const uniqueCode = await generateUniqueSlug(
        models.CustomFieldGroups,
        data.clientPortalId,
        'code',
        buildFieldGroupCode(data.code, data.label),
      );
      data.code = uniqueCode;

      const count = await models.CustomFieldGroups.countDocuments({
        clientPortalId: data.clientPortalId,
        label: data.label,
      });
      if (count > 0) {
        data.label = `${data.label} (${count + 1})`;
      }
      return await models.CustomFieldGroups.create(data);
    };

    public static updateFieldGroup = async (
      id: string,
      data: ICustomFieldGroup,
    ) => {
      const existingGroup = await models.CustomFieldGroups.findById(id);

      if (!existingGroup) {
        throw new Error('Field group not found');
      }

      const clientPortalId =
        data.clientPortalId || existingGroup.clientPortalId;

      if (data.code && data.code !== existingGroup.code) {
        data.code = await generateUniqueSlugForUpdate({
          model: models.CustomFieldGroups,
          clientPortalId,
          field: 'code',
          baseSlug: buildFieldGroupCode(data.code),
          excludeId: id,
        });
      } else if (!existingGroup.code) {
        data.code = await generateUniqueSlugForUpdate({
          model: models.CustomFieldGroups,
          clientPortalId,
          field: 'code',
          baseSlug: buildFieldGroupCode(data.code, data.label || existingGroup.label),
          excludeId: id,
        });
      }

      const updateData: Partial<ICustomFieldGroup> = omitUndefined({
        ...data,
        clientPortalId,
      });

      if (!('fields' in data)) {
        updateData.fields = existingGroup.fields;
      }

      return models.CustomFieldGroups.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true },
      );
    };
    public static deleteFieldGroup = async (id: string) => {
      return await models.CustomFieldGroups.findOneAndDelete({ _id: id });
    };

    public static getCustomFieldGroups = async (query: any) => {
      return await models.CustomFieldGroups.find(query)
        .sort({ name: 1 })
        .lean();
    };
  }
  fieldGroupSchema.loadClass(CustomFieldGroups);

  return fieldGroupSchema;
};
