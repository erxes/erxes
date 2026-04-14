import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { fieldGroupSchema } from '~/modules/properties/db/definitions/group';
import { IFieldGroup, IFieldGroupDocument } from '../../@types';
import { ORDER_GAP } from '../../constants';

export interface IFieldGroupModel extends Model<IFieldGroupDocument> {
  getGroup({ _id }: { _id: string }): Promise<IFieldGroupDocument>;
  createGroup(
    doc: IFieldGroup,
    user: IUserDocument,
  ): Promise<IFieldGroupDocument>;
  updateGroup(
    _id: string,
    doc: IFieldGroup,
    user: IUserDocument,
  ): Promise<IFieldGroupDocument>;
  removeGroup(_id: string): Promise<IFieldGroupDocument>;
}

export const loadFieldGroupClass = (models: IModels) => {
  class FieldGroup {
    public static async getGroup({ _id }: { _id: string }) {
      const group = await models.FieldsGroups.findOne({ _id }).lean();

      if (!group) {
        throw new Error('Group not found');
      }

      return group;
    }

    public static async createGroup(doc: IFieldGroup, user: IUserDocument) {
      await this.validateGroup(doc);

      const { contentType } = doc || {};

      doc.order = await this.generateOrder({ contentType });

      return models.FieldsGroups.create({ ...doc, createdBy: user._id });
    }

    public static async updateGroup(
      _id: string,
      doc: IFieldGroup,
      user: IUserDocument,
    ) {
      await this.validateGroup(doc, _id);

      return models.FieldsGroups.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeGroup(_id: string) {
      await this.validateGroup({} as IFieldGroup, _id);

      // Deleting fields that are associated with this group
      const fields = await models.Fields.find({ groupId: _id }).lean();

      for (const field of fields) {
        await models.Fields.removeField(field._id.toString());
      }

      return models.FieldsGroups.findOneAndDelete({ _id });
    }

    public static async generateOrder({
      contentType,
    }: {
      contentType: string;
    }) {
      const group = await models.FieldsGroups.findOne({ contentType }).sort({
        order: -1,
      });

      return (group?.order || 0) + ORDER_GAP;
    }

    public static async validateGroup(doc: IFieldGroup, _id?: string) {
      const { code } = doc || {};

      if (code && _id) {
        const group = await models.FieldsGroups.getGroup({ _id });

        if (group.code !== code) {
          const group = await models.FieldsGroups.findOne({ code }).lean();

          if (group) {
            throw new Error('Group code already exists');
          }
        }
      }

      if (code && !_id) {
        const group = await models.FieldsGroups.findOne({ code }).lean();

        if (group) {
          throw new Error('Group code already exists');
        }
      }
    }
  }

  fieldGroupSchema.loadClass(FieldGroup);

  return fieldGroupSchema;
};
