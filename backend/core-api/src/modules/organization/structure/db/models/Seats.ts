import { bumpPermissionCacheVersion } from 'erxes-api-shared/core-modules';
import {
  IStructureSeat,
  IStructureSeatDocument,
  TStructureSeatCoverage,
} from 'erxes-api-shared/core-types';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  STRUCTURE_ENTITY_STATUSES,
  STRUCTURE_SEAT_COVERAGES,
} from '../../constants';
import { activeMembershipFilter, orderPrefixFilter } from '../../utils';
import { structureSeatSchema } from '../definitions/structure';

export interface IStructureSeatInput
  extends Omit<IStructureSeat, 'coveredEntityIds'> {
  coveredEntityIds?: string[];
}

export type TStructureSeatEditInput = Partial<
  Pick<IStructureSeatInput, 'coverage' | 'coveredEntityIds'>
>;

export interface IStructureSeatModel extends Model<IStructureSeatDocument> {
  getSeat(_id: string): Promise<IStructureSeatDocument>;
  normalizeSeat(doc: IStructureSeatInput): Promise<IStructureSeat>;
  createSeat(
    doc: IStructureSeatInput,
    userId: string,
  ): Promise<IStructureSeatDocument>;
  updateSeat(
    _id: string,
    doc: TStructureSeatEditInput,
    userId: string,
  ): Promise<IStructureSeatDocument>;
  removeSeat(_id: string): Promise<IStructureSeatDocument>;
  getHolderIds(seatId: string): Promise<string[]>;
  addHolders(
    seatId: string,
    userIds: string[],
    actorId: string,
  ): Promise<IStructureSeatDocument>;
  removeHolder(seatId: string, userId: string): Promise<IStructureSeatDocument>;
}

const COVERAGES = Object.values(STRUCTURE_SEAT_COVERAGES);

const isCoverage = (value: string): value is TStructureSeatCoverage =>
  COVERAGES.includes(value as TStructureSeatCoverage);

export const loadStructureSeatClass = (models: IModels, subdomain: string) => {
  const cleanCoverage = async (
    entityId: string,
    coverage: string,
    coveredEntityIds: string[] | undefined,
  ) => {
    if (!isCoverage(coverage)) {
      throw new Error(`Unknown coverage "${coverage}"`);
    }

    if (coverage !== STRUCTURE_SEAT_COVERAGES.SELECTED) {
      return { coverage, coveredEntityIds: [] };
    }

    const entity = await withoutPermissionScope(() =>
      models.StructureEntities.getEntity(entityId),
    );
    const ids = [...new Set(coveredEntityIds || [])].filter(
      (id) => id !== entityId,
    );

    if (!ids.length) {
      throw new Error('Choose at least one node below the seat node');
    }

    const below = await withoutPermissionScope(() =>
      models.StructureEntities.countDocuments({
        _id: { $in: ids },
        ...orderPrefixFilter([entity.order]),
      }),
    );

    if (below !== ids.length) {
      throw new Error('Covered nodes must be below the seat node');
    }

    return { coverage, coveredEntityIds: ids };
  };

  class StructureSeat {
    public static async getSeat(_id: string) {
      const seat = await models.StructureSeats.findOne({ _id });

      if (!seat) {
        throw new Error('Seat not found');
      }

      return seat;
    }

    public static async normalizeSeat(
      doc: IStructureSeatInput,
    ): Promise<IStructureSeat> {
      await models.StructurePositions.getPosition(doc.positionId);

      const entity = await models.StructureEntities.getEntity(doc.entityId);

      if (entity.status !== STRUCTURE_ENTITY_STATUSES.ACTIVE) {
        throw new Error('Node is archived');
      }

      return {
        positionId: doc.positionId,
        entityId: entity._id,
        ...(await cleanCoverage(
          entity._id,
          doc.coverage,
          doc.coveredEntityIds,
        )),
      };
    }

    public static async createSeat(doc: IStructureSeatInput, userId: string) {
      const seat = await models.StructureSeats.create({
        ...(await models.StructureSeats.normalizeSeat(doc)),
        createdBy: userId,
      });

      await bumpPermissionCacheVersion(subdomain);

      return seat;
    }

    public static async updateSeat(
      _id: string,
      doc: TStructureSeatEditInput,
      userId: string,
    ) {
      const seat = await models.StructureSeats.getSeat(_id);

      await models.StructureSeats.updateOne(
        { _id },
        {
          $set: {
            ...(await cleanCoverage(
              seat.entityId,
              doc.coverage || seat.coverage,
              doc.coveredEntityIds ?? seat.coveredEntityIds,
            )),
            updatedBy: userId,
          },
        },
      );

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureSeats.getSeat(_id);
    }

    public static async removeSeat(_id: string) {
      const seat = await models.StructureSeats.getSeat(_id);

      await models.StructureEntityMembers.updateMany(
        { seatIds: _id, ...activeMembershipFilter() },
        { $pull: { seatIds: _id } },
      );
      await models.StructureSeats.deleteOne({ _id });

      await bumpPermissionCacheVersion(subdomain);

      return seat;
    }

    public static async getHolderIds(seatId: string) {
      return models.StructureEntityMembers.distinct('userId', {
        seatIds: seatId,
        ...activeMembershipFilter(),
      });
    }

    public static async addHolders(
      seatId: string,
      userIds: string[],
      actorId: string,
    ) {
      const seat = await models.StructureSeats.getSeat(seatId);

      for (const userId of new Set(userIds)) {
        await models.StructureEntityMembers.addSeat(
          seat.entityId,
          userId,
          seat._id,
          actorId,
        );
      }

      return seat;
    }

    public static async removeHolder(seatId: string, userId: string) {
      const seat = await models.StructureSeats.getSeat(seatId);

      await models.StructureEntityMembers.removeSeat(
        seat.entityId,
        userId,
        seat._id,
      );

      return seat;
    }
  }

  structureSeatSchema.loadClass(StructureSeat);

  return structureSeatSchema;
};
