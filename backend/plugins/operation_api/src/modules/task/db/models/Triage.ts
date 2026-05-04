import { IModels } from '~/connectionResolvers';
import {
  ITriage,
  ITriageDocument,
  ITriageUpdateInput,
} from '@/task/@types/triage';
import { Model } from 'mongoose';
import { triageSchema } from '../definitions/triage';
import { createNotifications } from '~/utils/notifications';

export interface ITriageModel extends Model<ITriageDocument> {
  getTriage(_id: string): Promise<ITriageDocument>;
  createTriage({
    subdomain,
    triage,
  }: {
    subdomain: string;
    triage: ITriage;
  }): Promise<ITriageDocument>;
  updateTriage(
    _id: string,
    triage: ITriageUpdateInput,
  ): Promise<ITriageDocument>;
  deleteTriage(_id: string): Promise<{ ok: number }>;
}

export const loadTriageClass = (models: IModels) => {
  class Triage {
    public static async getTriage(_id: string) {
      return await models.Triage.findOne({ _id }).lean();
    }

    public static async createTriage({
      triage,
      subdomain,
    }: {
      triage: ITriage;
      subdomain: string;
    }) {
      const teamMembers = await models.TeamMember.find({
        teamId: triage.teamId,
      });

      const [result] = await models.Triage.aggregate([
        { $match: { teamId: triage.teamId } },
        { $group: { _id: null, maxNumber: { $max: '$number' } } },
      ]);

      const nextNumber = (result?.maxNumber || 0) + 1;

      triage.number = nextNumber;

      const userIds = teamMembers
        .map((member) => member.memberId)
        .filter((userId) => userId !== triage.createdBy);

      const triageDoc = await models.Triage.create(triage);
      if (userIds.length > 0) {
        await createNotifications({
          contentType: 'triage',
          contentTypeId: triageDoc._id,
          fromUserId: triage.createdBy,
          subdomain,
          notificationType: 'triage',
          userIds,
          action: 'created',
          models,
        });
      }
      return triageDoc;
    }

    public static async updateTriage(_id: string, triage: ITriageUpdateInput) {
      return await models.Triage.findOneAndUpdate({ _id }, triage, {
        new: true,
      });
    }

    public static async deleteTriage(_id: string) {
      return await models.Triage.deleteOne({ _id });
    }
  }

  triageSchema.loadClass(Triage);

  return triageSchema;
};
