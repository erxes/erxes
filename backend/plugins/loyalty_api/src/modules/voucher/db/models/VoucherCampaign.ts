import {
  IVoucherAutoIssue,
  IVoucherCampaign,
  IVoucherCampaignDocument,
  TVoucherAutoIssueKind,
  VOUCHER_AUTO_ISSUE_ENGINES,
  VOUCHER_AUTO_ISSUE_KINDS,
} from '@/voucher/@types/voucherCampaign';
import { voucherCampaignSchema } from '@/voucher/db/definitions/voucherCampaign';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { validCampaign } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IVoucherCampaignModel extends Model<IVoucherCampaignDocument> {
  getVoucherCampaign(_id: string): Promise<IVoucherCampaignDocument>;
  createVoucherCampaign(
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument>;
  updateVoucherCampaign(
    _id: string,
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument>;
  removeVoucherCampaigns(_ids: string[]): void;
  setVoucherAutoIssue(
    _id: string,
    autoIssue: IVoucherAutoIssue,
  ): Promise<IVoucherCampaignDocument>;
  removeVoucherAutoIssue(
    _id: string,
    kind: TVoucherAutoIssueKind,
  ): Promise<IVoucherCampaignDocument>;
}

const validVoucherCampaign = async (doc) => {
  validCampaign(doc);

  if (doc.bonusProductId && !doc.bonusCount) {
    throw new Error('Must fill product count or product limit to false');
  }

  if (doc.spinCampaignId && !doc.spinCount) {
    throw new Error('Must fill spin count when choosed spin campaign');
  }

  if (doc.lotteryCampaignId && !doc.lotteryCount) {
    throw new Error('Must fill lottery count when choosed lottery campaign');
  }

  // A score voucher leaves only a score log behind, with nothing to count.
  if (doc.perOwnerLimit && doc.voucherType === 'score') {
    throw new Error('A score voucher cannot be limited per owner');
  }
};

const validAutoIssue = ({ kind, segmentId, parts = [] }: IVoucherAutoIssue) => {
  if (!VOUCHER_AUTO_ISSUE_KINDS.includes(kind)) {
    throw new Error(`Unknown auto issue kind: ${kind}`);
  }

  if (!segmentId) {
    throw new Error('Auto issue needs the segment it follows');
  }

  // Each engine at most once, so switching and removing reach every part.
  const engines = parts.map(({ engine }) => engine);

  if (
    !parts.length ||
    parts.some(
      ({ engine, id }) => !id || !VOUCHER_AUTO_ISSUE_ENGINES.includes(engine),
    ) ||
    new Set(engines).size !== engines.length
  ) {
    throw new Error('Auto issue parts are invalid');
  }
};

export const loadVoucherCampaignClass = (
  models: IModels,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class VoucherCampaign {
    public static async getVoucherCampaign(_id: string) {
      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id,
      }).lean();

      if (!voucherCampaign) {
        throw new Error('not found voucher rule');
      }

      return voucherCampaign;
    }

    public static async createVoucherCampaign(doc) {
      try {
        await validVoucherCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      doc = {
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      const created = await models.VoucherCampaigns.create(doc);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateVoucherCampaign(_id, doc) {
      try {
        await validVoucherCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const voucherCampaignDB =
        await models.VoucherCampaigns.getVoucherCampaign(_id);

      if (voucherCampaignDB.voucherType !== doc.voucherType) {
        let usedVoucherCount = 0;
        switch (voucherCampaignDB.voucherType) {
          case 'spin':
            usedVoucherCount = Number(
              await models.Spins.find({
                campaignId: voucherCampaignDB.spinCampaignId,
              }).countDocuments(),
            );
            break;
          case 'lottery':
            usedVoucherCount = Number(
              await models.Lotteries.find({
                campaignId: voucherCampaignDB.lotteryCampaignId,
              }).countDocuments(),
            );
            break;
          default:
            usedVoucherCount = Number(
              await models.Vouchers.find({
                campaignId: voucherCampaignDB._id,
              }).countDocuments(),
            );
        }

        if (usedVoucherCount) {
          throw new Error(
            `Cant change voucher type because: this voucher Campaign in used. Set voucher type: ${voucherCampaignDB.voucherType}`,
          );
        }
      }

      const oldDoc = await models.VoucherCampaigns.findOne({ _id }).lean();
      doc = {
        ...doc,
        modifiedAt: new Date(),
      };

      const result = await models.VoucherCampaigns.updateOne(
        { _id },
        { $set: doc },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: doc,
        prevDocument: oldDoc,
      });

      return result;
    }

    public static async removeVoucherCampaigns(ids: string[]) {
      const atVoucherIds = await models.Vouchers.find({
        voucherCampaignId: { $in: ids },
      }).distinct('voucherCampaignId');

      const atDonateCampaignIds = await models.DonateCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const atLotteryCampaignIds = await models.LotteryCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const atSpinCampaignIds = await models.SpinCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const campaignIds = [
        ...atVoucherIds,
        ...atDonateCampaignIds,
        ...atLotteryCampaignIds,
        ...atSpinCampaignIds,
      ];
      const usedCampaignIds = ids.filter((id) => campaignIds.includes(id));
      const deleteCampaignIds = ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );

      const now = new Date();

      // For used ones, soft delete (status = TRASH)
      if (usedCampaignIds.length) {
        await models.VoucherCampaigns.updateMany(
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

      // Hard delete unused ones
      if (deleteCampaignIds.length) {
        const result = await models.VoucherCampaigns.deleteMany({
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

    /** One entry per kind: setting it again replaces the earlier one. */
    public static async setVoucherAutoIssue(
      _id: string,
      autoIssue: IVoucherAutoIssue,
    ) {
      validAutoIssue(autoIssue);

      const campaign = await models.VoucherCampaigns.getVoucherCampaign(_id);
      const next = [
        ...(campaign.autoIssue || []).filter(
          ({ kind }) => kind !== autoIssue.kind,
        ),
        autoIssue,
      ];

      return VoucherCampaign.writeAutoIssue(_id, next, campaign.autoIssue);
    }

    public static async removeVoucherAutoIssue(
      _id: string,
      kind: TVoucherAutoIssueKind,
    ) {
      const campaign = await models.VoucherCampaigns.getVoucherCampaign(_id);
      const next = (campaign.autoIssue || []).filter(
        (entry) => entry.kind !== kind,
      );

      return VoucherCampaign.writeAutoIssue(_id, next, campaign.autoIssue);
    }

    private static async writeAutoIssue(
      _id: string,
      autoIssue: IVoucherAutoIssue[],
      prevAutoIssue?: IVoucherAutoIssue[],
    ) {
      const modifiedAt = new Date();

      await models.VoucherCampaigns.updateOne(
        { _id },
        { $set: { autoIssue, modifiedAt } },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: { autoIssue, modifiedAt },
        prevDocument: { autoIssue: prevAutoIssue },
      });

      return models.VoucherCampaigns.getVoucherCampaign(_id);
    }
  }

  voucherCampaignSchema.loadClass(VoucherCampaign);

  return voucherCampaignSchema;
};
