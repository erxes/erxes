import {
  featuredFieldCode,
  IFeaturedFieldGroup,
  IFeaturedFieldOwner,
} from 'erxes-api-shared/core-modules';
import { IOrderInput, IUserDocument } from 'erxes-api-shared/core-types';
import { updateOrder } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { fieldGroupSchema } from '~/modules/properties/db/definitions/group';
import { IFieldGroup, IFieldGroupDocument } from '../../@types';
import { ORDER_GAP } from '../../constants';

// What a user may still change on a group a plugin owns.
const OWNED_GROUP_EDITABLE = ['name', 'description', 'order'] as const;

const isLayout = (value: unknown): value is string[][] =>
  Array.isArray(value) &&
  value.every(
    (row) => Array.isArray(row) && row.every((id) => typeof id === 'string'),
  );

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
  archiveGroup(
    _id: string,
    user: IUserDocument,
  ): Promise<IFieldGroupDocument | null>;
  restoreGroup(_id: string): Promise<IFieldGroupDocument | null>;
  ensureFeaturedGroup(args: {
    owner: IFeaturedFieldOwner;
    contentType: string;
    group: IFeaturedFieldGroup;
  }): Promise<IFieldGroupDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IFieldGroupDocument[]>;
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

      const layout = doc.configs?.layout;

      if (layout !== undefined && !isLayout(layout)) {
        throw new Error('Layout must be rows of field ids');
      }

      const group = await models.FieldsGroups.getGroup({ _id });
      const $set: Record<string, unknown> = group.owner
        ? Object.fromEntries(
            OWNED_GROUP_EDITABLE.filter((key) => doc[key] !== undefined).map(
              (key) => [key, doc[key]],
            ),
          )
        : { ...doc };

      // A plugin owns its group's fields, but how they are laid out is presentation.
      const clearOwnedLayout = group.owner && doc.configs && !layout;

      if (group.owner && layout) {
        $set['configs.layout'] = layout;
      }

      return models.FieldsGroups.findOneAndUpdate(
        { _id },
        {
          $set: { ...$set, updatedBy: user._id },
          ...(clearOwnedLayout && { $unset: { 'configs.layout': '' } }),
        },
        { new: true },
      );
    }

    public static async removeGroup(_id: string) {
      await this.validateGroup({} as IFieldGroup, _id);

      const group = await models.FieldsGroups.getGroup({ _id });

      if (group.owner) {
        throw new Error(`Group is managed by ${group.owner.plugin}`);
      }

      const fields = await models.Fields.find({ groupId: _id }).lean();
      const ids = fields.map((field) => String(field._id));

      const usage = await models.Fields.getFieldUsage({
        ids,
        groupId: _id,
        contentType: group.contentType,
      });

      if (!usage.removable) {
        throw new Error('In use or could not be checked; archive it instead');
      }

      await models.Fields.deleteMany({ _id: { $in: ids } });

      return models.FieldsGroups.findOneAndDelete({ _id });
    }

    // Its fields go with it; values stay on records.
    public static async archiveGroup(_id: string, user: IUserDocument) {
      const group = await models.FieldsGroups.getGroup({ _id });

      if (group.owner) {
        throw new Error(`Group is managed by ${group.owner.plugin}`);
      }

      const archivedAt = new Date();

      await models.Fields.updateMany(
        { groupId: _id, archivedAt: { $exists: false } },
        { $set: { archivedAt, archivedBy: user._id, archivedWithGroup: true } },
      );

      return models.FieldsGroups.findOneAndUpdate(
        { _id },
        { $set: { archivedAt, archivedBy: user._id } },
        { new: true },
      );
    }

    // Fields archived on their own before the group stay archived.
    public static async restoreGroup(_id: string) {
      await models.Fields.updateMany(
        { groupId: _id, archivedWithGroup: true },
        { $unset: { archivedAt: '', archivedBy: '', archivedWithGroup: '' } },
      );

      return models.FieldsGroups.findOneAndUpdate(
        { _id },
        { $unset: { archivedAt: '', archivedBy: '' } },
        { new: true },
      );
    }

    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.FieldsGroups, orders);
    }

    public static async ensureFeaturedGroup({
      owner,
      contentType,
      group,
    }: {
      owner: IFeaturedFieldOwner;
      contentType: string;
      group: IFeaturedFieldGroup;
    }) {
      const code = featuredFieldCode(owner, group.key);
      const existing = await models.FieldsGroups.findOne({ code }).lean();

      if (existing) {
        return existing;
      }

      return models.FieldsGroups.create({
        name: group.name,
        code,
        contentType,
        order: await this.generateOrder({ contentType }),
        owner: { ...owner, key: group.key },
      });
    }

    public static async generateOrder({
      contentType,
    }: {
      contentType: string;
    }) {
      const group = await models.FieldsGroups.findOne({ contentType })
        .sort({ order: -1 })
        .lean();

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
