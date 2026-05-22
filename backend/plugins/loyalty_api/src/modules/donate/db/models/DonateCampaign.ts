import {
  IDonateCampaign,
  IDonateCampaignDocument,
} from '@/donate/@types/donateCampaign';
import { donateCampaignSchema } from '@/donate/db/definitions/donateCampaign';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { validCampaign } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IDonateCampaignModel extends Model<IDonateCampaignDocument> {
  getDonateCampaign(_id: string): Promise<IDonateCampaignDocument>;
  createDonateCampaign(
    doc: IDonateCampaign,
    userId: string,
  ): Promise<IDonateCampaignDocument>;
  updateDonateCampaign(
    _id: string,
    doc: IDonateCampaign,
  ): Promise<IDonateCampaignDocument>;
  removeDonateCampaigns(_ids: string[]): void;
}

const getSortAwards = (awards) => {
  return awards.sort((a, b) => a.minScore - b.minScore);
};

export const loadDonateCampaignClass = (
  models: IModels,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class DonateCampaign {
    public static async getDonateCampaign(_id: string) {
      const donateCampaign = await models.DonateCampaigns.findOne({ _id });

      if (!donateCampaign) {
        throw new Error('not found donate campaign');
      }

      return donateCampaign;
    }

    static async validDonateCampaign(doc: IDonateCampaign) {
      validCampaign(doc);

      const awards = doc.awards || [];

      if (
        doc.maxScore &&
        awards.length &&
        (awards[awards.length - 1].minScore || 0) > doc.maxScore
      ) {
        throw new Error('Max score must be greather than level scores');
      }

      const levels = awards.map((a) => a.minScore);

      if (levels.length > new Set(levels).size) {
        throw new Error('Levels scores must be unique');
      }
    }

    public static async createDonateCampaign(
      doc: IDonateCampaign,
      userId: string,
    ) {
      const modifier = {
        ...doc,
        awards: getSortAwards(doc.awards),
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      try {
        await this.validDonateCampaign(modifier);
      } catch (e) {
        throw new Error(e.message);
      }

      const created = await models.DonateCampaigns.create(modifier);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateDonateCampaign(
      _id: string,
      doc: IDonateCampaign,
    ) {
      const prevDoc = await models.DonateCampaigns.findOne({ _id }).lean();
      const modifier = {
        ...doc,
        awards: getSortAwards(doc.awards),
        modifiedAt: new Date(),
      };

      try {
        await this.validDonateCampaign(modifier);
      } catch (e) {
        throw new Error(e.message);
      }

      const result = await models.DonateCampaigns.updateOne({ _id }, { $set: modifier });

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: modifier,
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeDonateCampaigns(ids: string[]) {
      const atDonateIds = await models.Donates.find({
        campaignId: { $in: ids },
      }).distinct('campaignId');

      const usedCampaignIds = ids.filter((id) => atDonateIds.includes(id));
      const deleteCampaignIds = ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );
      const now = new Date();

      if (usedCampaignIds.length) {
        await models.DonateCampaigns.updateMany(
          { _id: { $in: usedCampaignIds } },
          { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } },
        );
        for (const id of usedCampaignIds) {
          sendDbEventLog?.({
            action: 'update',
            docId: id,
            currentDocument: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now },
          });
        }
      }

      if (deleteCampaignIds.length) {
        const result = await models.DonateCampaigns.deleteMany({
          _id: { $in: deleteCampaignIds },
        });
        for (const id of deleteCampaignIds) {
          sendDbEventLog?.({
            action: 'delete',
            docId: id,
          });
        }
        return result;
      }

      return { deletedCount: 0 };
    }
  }

  donateCampaignSchema.loadClass(DonateCampaign);

  return donateCampaignSchema;
};