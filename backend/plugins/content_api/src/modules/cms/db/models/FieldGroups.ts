import { Model } from 'mongoose';

import {
  ICustomFieldGroup,
  ICustomFieldGroupDocument,
} from '@/cms/@types/customPostType';
import { IModels } from '~/connectionResolvers';
import { fieldGroupSchema } from '@/cms/db/definitions/customPostType';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface ICustomFieldGroupModel
  extends Model<ICustomFieldGroupDocument> {
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

export const loadCustomFieldGroupClass = (models: IModels) => {
  class CustomFieldGroups {
    public static createFieldGroup = async (data: ICustomFieldGroup) => {
      if (data.code) {
        const uniqueCode = await generateUniqueSlug(
          models.CustomFieldGroups,
          data.clientPortalId,
          'code',
          data.code,
        );
        data.code = uniqueCode;
      }
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
      if (data.code) {
        const uniqueCode = await generateUniqueSlug(
          models.CustomFieldGroups,
          data.clientPortalId,
          'code',
          data.code,
        );
        data.code = uniqueCode;
      }
      return models.CustomFieldGroups.findOneAndUpdate(
        { _id: id },
        { $set: data },
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
