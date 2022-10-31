import { Model } from 'mongoose';
import { IMovementDocument } from '../common/types/asset';
import { IModels } from '../connectionResolver';
import { movementSchema } from './definitions/movements';

export interface IMovementModel extends Model<IMovementDocument> {
  movements(params: any): Promise<IMovementDocument[]>;
  movementAdd(doc: any, userId: string): Promise<IMovementDocument>;
  movementRemove(ids: string[]): Promise<IMovementDocument>;
  movementEdit(_id: String, doc: any): Promise<IMovementDocument>;
}

export const loadMovementClass = (models: IModels) => {
  class Movement {
    public static async movements(params) {
      return models.Movements.find();
    }

    public static async movementAdd(doc: any, userId: string) {
      if (!doc.items) {
        throw new Error('No assets in  movement ');
      }

      if (!doc.description) {
        throw new Error('No description in movement ');
      }

      if (!doc.movedAt) {
        throw new Error('No moved date in movement ');
      }

      const addedAssets = await models.MovementItems.movementItemsAdd(
        doc.items
      );

      const movementItemIds = addedAssets.map(asset => asset._id);

      const movement = await models.Movements.create({
        movedAt: doc.movedAt,
        description: doc.description,
        userId,
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      await models.MovementItems.updateMany(
        { _id: { $in: movementItemIds } },
        { $set: { movementId: movement._id } }
      );

      return movement;
    }

    public static async movementEdit(_id: string, doc: any) {
      if (!_id) {
        throw new Error('You must provide a id');
      }
      const movement = await models.Movements.findOne({ _id });

      if (!movement) {
        throw new Error('Movement not found');
      }

      await models.MovementItems.movementItemsEdit(_id, doc.items);
      await models.Movements.update(
        { _id },
        {
          $set: {
            movedAt: doc.movedAt,
            description: doc.description,
            modifiedAt: new Date()
          }
        }
      );
      return 'updated';
    }

    public static async movementRemove(ids: string[]) {
      if (!ids) {
        throw new Error('You must specify a valid id');
      }
      try {
        const movements = await models.Movements.find({ _id: { $in: ids } });

        if (movements.length === 0) {
          throw new Error('Something went wrong');
        }

        await models.MovementItems.deleteMany({ movementId: { $in: ids } });

        await models.Movements.remove({ _id: { $in: ids } });
      } catch (error) {
        throw new Error(error.message);
      }

      return 'removed';
    }
  }

  movementSchema.loadClass(Movement);

  return movementSchema;
};
