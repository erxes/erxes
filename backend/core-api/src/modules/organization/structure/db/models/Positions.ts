import { bumpPermissionCacheVersion } from 'erxes-api-shared/core-modules';
import {
  IStructurePosition,
  IStructurePositionDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { structurePositionSchema } from '../definitions/structure';

export interface IStructurePositionModel
  extends Model<IStructurePositionDocument> {
  getPosition(_id: string): Promise<IStructurePositionDocument>;
  createPosition(
    doc: IStructurePosition,
    userId: string,
  ): Promise<IStructurePositionDocument>;
  updatePosition(
    _id: string,
    doc: Partial<IStructurePosition>,
    userId: string,
  ): Promise<IStructurePositionDocument>;
  removePosition(_id: string): Promise<IStructurePositionDocument>;
}

export const loadStructurePositionClass = (
  models: IModels,
  subdomain: string,
) => {
  const cleanName = (name: string | undefined) => {
    const trimmed = (name || '').trim();

    if (!trimmed) {
      throw new Error('Position name is required');
    }

    return trimmed;
  };

  const assertNameAvailable = async (name: string, excludeId?: string) => {
    const existing = await models.StructurePositions.exists({
      name,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (existing) {
      throw new Error(`Position "${name}" already exists`);
    }
  };

  const cleanGroupIds = async (groupIds: string[] | undefined) => {
    const ids = [...new Set(groupIds || [])];

    if (!ids.length) {
      return ids;
    }

    const found = await models.PermissionGroups.distinct('_id', {
      _id: { $in: ids },
    });
    const unknown = ids.filter((id) => !found.includes(id));

    if (unknown.length) {
      throw new Error(`Unknown permission group(s): ${unknown.join(', ')}`);
    }

    return ids;
  };

  class StructurePosition {
    public static async getPosition(_id: string) {
      const position = await models.StructurePositions.findOne({ _id });

      if (!position) {
        throw new Error('Position not found');
      }

      return position;
    }

    public static async createPosition(
      doc: IStructurePosition,
      userId: string,
    ) {
      const name = cleanName(doc.name);

      await assertNameAvailable(name);

      return models.StructurePositions.create({
        name,
        description: doc.description,
        groupIds: await cleanGroupIds(doc.groupIds),
        createdBy: userId,
      });
    }

    public static async updatePosition(
      _id: string,
      doc: Partial<IStructurePosition>,
      userId: string,
    ) {
      await models.StructurePositions.getPosition(_id);

      const update: Partial<IStructurePosition> & { updatedBy: string } = {
        updatedBy: userId,
      };

      if (doc.name !== undefined) {
        update.name = cleanName(doc.name);
        await assertNameAvailable(update.name, _id);
      }

      if (doc.description !== undefined) {
        update.description = doc.description;
      }

      if (doc.groupIds !== undefined) {
        update.groupIds = await cleanGroupIds(doc.groupIds);
      }

      await models.StructurePositions.updateOne({ _id }, { $set: update });

      if (update.groupIds) {
        await bumpPermissionCacheVersion(subdomain);
      }

      return models.StructurePositions.getPosition(_id);
    }

    public static async removePosition(_id: string) {
      const position = await models.StructurePositions.getPosition(_id);
      const seats = await models.StructureSeats.countDocuments({
        positionId: _id,
      });

      if (seats) {
        throw new Error(
          `${seats} seat(s) use this position. Remove them first`,
        );
      }

      await models.StructurePositions.deleteOne({ _id });

      return position;
    }
  }

  structurePositionSchema.loadClass(StructurePosition);

  return structurePositionSchema;
};
