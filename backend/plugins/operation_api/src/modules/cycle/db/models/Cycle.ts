import { cycleSchema } from '@/cycle/db/definitions/cycle';
import { ICycle, ICycleDocument } from '@/cycle/types';
import {
  getCycleProgressByMember,
  getCycleProgressByProject,
  getCycleProgressChart,
  getCyclesProgress,
} from '@/cycle/utils';
import { format, isBefore, isSameDay, startOfDay } from 'date-fns';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ICycleModel extends Model<ICycleDocument> {
  getCycle(_id: string): Promise<ICycleDocument>;
  getCycles(filter: FilterQuery<ICycleDocument>): Promise<ICycleDocument[]>;
  createCycle({ doc }: { doc: ICycle }): Promise<ICycleDocument>;
  updateCycle(doc: ICycleDocument): Promise<ICycleDocument>;
  removeCycle({ _id }: { _id: string }): Promise<{ ok: number }>;
  startCycle(_id: string): Promise<ICycleDocument>;
  endCycle(_id: string): Promise<ICycleDocument>;
}

export const loadCycleClass = (models: IModels) => {
  class Cycle {
    public static async getCycle(_id: string) {
      const cycle = await models.Cycle.findOne({
        _id,
      });

      if (!cycle) {
        throw new Error('Cycle not found');
      }
      return cycle;
    }

    public static async removeCycle({ _id }: { _id: string }) {
      const cycles = await models.Cycle.deleteOne({ _id });
      return cycles;
    }

    public static async createCycle({
      doc,
    }: {
      doc: ICycle;
    }): Promise<ICycleDocument> {
      const { startDate, endDate } = doc;

      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      const overlappingCycle = await models.Cycle.findOne({
        teamId: doc.teamId,
        $or: [
          {
            startDate: { $lte: doc.endDate },
            endDate: { $gte: doc.startDate },
          },
        ],
      });

      if (overlappingCycle) {
        throw new Error('New cycle with an existing cycle');
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const start = format(doc.startDate, 'yyyy-MM-dd');

      if (isBefore(start, today)) {
        throw new Error('New cycle start date must be in the future');
      }

      const [result] = await models.Cycle.aggregate([
        { $match: { teamId: doc.teamId } },
        { $group: { _id: null, maxNumber: { $max: '$number' } } },
      ]);

      if (isSameDay(start, today)) {
        doc.isActive = true;
      }

      const nextNumber = (result?.maxNumber || 0) + 1;
      doc.number = nextNumber;

      return models.Cycle.create(doc);
    }

    public static async updateCycle(doc: ICycleDocument) {
      const { _id, ...rest } = doc;
      const cycle = await models.Cycle.findOne({
        _id,
      });

      if (cycle && cycle.isCompleted) {
        throw new Error('Completed cycle cannot be updated');
      }

      const overlappingCycle = await models.Cycle.findOne({
        teamId: cycle?.teamId,
        _id: { $ne: cycle?._id },
        $or: [
          {
            startDate: { $lte: doc.endDate || cycle?.endDate },
            endDate: { $gte: doc.startDate || cycle?.startDate },
          },
        ],
      });

      if (overlappingCycle) {
        throw new Error('New cycle overlaps with an existing cycle');
      }

      return models.Cycle.findOneAndUpdate(
        { _id },
        { $set: rest },
        { new: true },
      );
    }

    public static async startCycle(_id: string) {
      const cycle = await models.Cycle.getCycle(_id);

      if (cycle?.isActive) {
        throw new Error('Cycle is already active');
      }

      const team = await models.Team.getTeam(cycle.teamId);

      const cycles = await models.Cycle.find({
        isActive: true,
        isCompleted: false,
        teamId: team._id,
      });

      if (cycles?.length) {
        throw new Error('Previous cycle is active');
      }

      await models.Cycle.findOneAndUpdate(
        { _id },
        { $set: { isActive: true } },
        { new: true },
      );
    }

    public static async endCycle(_id: string) {
      const chartData = await getCycleProgressChart(_id, undefined, models);
      const progress = await getCyclesProgress(_id, undefined, models);
      const progressByMember = await getCycleProgressByMember(
        _id,
        undefined,
        models,
      );
      const progressByProject = await getCycleProgressByProject(
        _id,
        undefined,
        models,
      );

      const statistics = {
        chartData,
        progress,
        progressByMember,
        progressByProject,
      };

      const endedCycle = await models.Cycle.findOneAndUpdate(
        { _id },
        { $set: { isCompleted: true, isActive: false, statistics } },
        { new: true },
      );

      if (!endedCycle) {
        throw new Error('Cycle not found');
      }

      let nextCycle = await models.Cycle.findOneAndUpdate(
        {
          teamId: endedCycle.teamId,
          isCompleted: false,
        },
        { $set: { isActive: true } },
        { sort: { startDate: 1 }, new: true },
      );

      if (!nextCycle) {
        const duration =
          endedCycle.endDate.getTime() - endedCycle.startDate.getTime();

        const newStartDate = new Date(endedCycle.endDate.getTime() + 1);
        const newEndDate = new Date(newStartDate.getTime() + duration);

        nextCycle = await models.Cycle.create({
          teamId: endedCycle.teamId,
          startDate: newStartDate,
          endDate: newEndDate,
          isActive: true,
          isCompleted: false,
          name: `Cycle ${newStartDate.toDateString()}`,
          number: endedCycle.number + 1,
        });
      }

      const unFinishedTasks = await models.Task.moveCycle(
        endedCycle._id,
        nextCycle?._id,
      );

      await models.Cycle.updateOne(
        { _id: endedCycle._id },
        { $set: { unFinishedTasks } },
      );

      return { endedCycle, nextCycle, unFinishedTasks };
    }
  }

  return cycleSchema.loadClass(Cycle);
};
