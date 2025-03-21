import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ICustomPostType,
  ICustomPostTypeDocument,
  customPostTypeSchema,
} from './definitions/customPostTypes';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendCommonMessage } from '../messageBroker';

export interface ICustomPostTypeModel extends Model<ICustomPostTypeDocument> {
  getCustomPostType(_id: string): Promise<ICustomPostTypeDocument>;
  createCustomPostType(doc: ICustomPostType): Promise<ICustomPostTypeDocument>;
  updateCustomPostType(
    _id: string,
    doc: ICustomPostType
  ): Promise<ICustomPostTypeDocument>;
  removeCustomPostType(_id: string): Promise<any>;
}

export const loadCustomPostTypeClass = (models: IModels) => {
  class CustomPostType {
    private static async isCodeValid(code: string, clientPortalId: string) {
      const exists = await models.CustomPostTypes.countDocuments({
        code,
        clientPortalId,
      });

      if (exists > 0) {
        throw new Error('Custom post type code already exists');
      }

      if (!/^[a-zA-Z0-9_]+$/.test(code)) {
        throw new Error('Custom post type code has invalid characters');
      }

      return true;
    }

    public static async getCustomPostType(_id: string) {
      const customPostType = await models.CustomPostTypes.findOne({ _id });

      if (!customPostType) {
        throw new Error('Custom post type not found');
      }

      return customPostType;
    }

    public static async createCustomPostType(doc: ICustomPostType) {
      await this.isCodeValid(doc.code, doc.clientPortalId);

      return models.CustomPostTypes.create(doc);
    }

    public static async updateCustomPostType(
      _id: string,
      doc: ICustomPostType
    ) {
      await this.isCodeValid(doc.code, doc.clientPortalId);

      const customPostType = await models.CustomPostTypes.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true }
      );

      if (!customPostType) {
        throw new Error('Custom post type not found');
      }

      return customPostType;
    }

    public static async removeCustomPostType(_id: string) {
      const customPostType = await models.CustomPostTypes.findOne({ _id });

      if (!customPostType) {
        throw new Error('Custom post type not found');
      }

      // Check if there are any posts using this custom post type
      const postsCount = await models.Posts.countDocuments({
        customPostTypeId: _id,
      });

      if (postsCount > 0) {
        throw new Error(
          'Cannot delete custom post type that is being used by posts'
        );
      }

      await models.CustomPostTypes.deleteOne({ _id });
      return { success: true };
    }
  }

  customPostTypeSchema.loadClass(CustomPostType);

  return customPostTypeSchema;
};
