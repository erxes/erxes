import * as _ from 'underscore';
import { CAMPAIGN_STATUS, LOTTERY_STATUS } from './definitions/constants';
import { Model, model } from 'mongoose';
import { getRandomNumber, randomBetween, validCampaign } from './utils';
import { IModels } from '../connectionResolver';
import { ILotteryAward, ILotteryCampaign, ILotteryCampaignDocument, lotteryCampaignSchema } from './definitions/lotteryCampaigns';
import { ILottery } from './definitions/lotteries';

export interface ILotteryCampaignModel extends Model<ILotteryCampaignDocument> {
  getLotteryCampaign(_id: string): Promise<ILotteryCampaignDocument>;
  createLotteryCampaign(doc: ILotteryCampaign): Promise<ILotteryCampaignDocument>;
  updateLotteryCampaign(_id: string, doc: ILotteryCampaign): Promise<ILotteryCampaignDocument>;
  removeLotteryCampaigns(_ids: string[]): void;
  doLottery({ campaignId, awardId }: { campaignId: string, awardId: string }): Promise<ILottery>;
  getNextChar({ campaignId, awardId, prevChars }: { campaignId: string, awardId: string, prevChars: string }): Promise<any>;
  multipleDoLottery({ campaignId, awardId, multiple }): Promise<any>;
};

export const loadLotteryCampaignClass = (models: IModels, _subdomain: string) => {
  class LotteryCampaign {
    public static async getLotteryCampaign(_id: string) {
      const lotteryCampaign = await models.LotteryCampaigns.findOne({ _id });

      if (!lotteryCampaign) {
        throw new Error('not found lottery campaign');
      }

      return lotteryCampaign;
    }

    static async validLotteryCampaign(doc) {
      validCampaign(doc)
    }

    public static async createLotteryCampaign(doc: ILotteryCampaign) {
      try {
        await this.validLotteryCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const modifier = {
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      }

      return models.LotteryCampaigns.create(modifier);
    }

    public static async updateLotteryCampaign(_id: string, doc: ILotteryCampaign) {
      try {
        await this.validLotteryCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const modifier = {
        ...doc,
        modifiedAt: new Date(),
      }

      return models.LotteryCampaigns.updateOne({ _id }, { $set: modifier });
    }

    public static async removeLotteryCampaigns(ids: string[]) {
      const atLotteryIds = await models.Lotteries.find({
        campaignId: { $in: ids }
      }).distinct('campaignId');

      const atVoucherIds = await models.VoucherCampaigns.find({
        lotteryCampaignId: { $in: ids }
      }).distinct('lotteryCampaignId');

      const campaignIds = [...atLotteryIds, ...atVoucherIds];

      const usedCampaignIds = ids.filter(id => (campaignIds.includes(id)));
      const deleteCampaignIds = ids.map(id => !usedCampaignIds.includes(id));
      const now = new Date();

      await models.LotteryCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } }
      );

      return models.LotteryCampaigns.deleteMany({ _id: { $in: deleteCampaignIds } });
    }

    static async validDoLottery(campaignId, awardId) {
      const campaign = await (await models.LotteryCampaigns.getLotteryCampaign(campaignId)).toObject();
      const award = campaign.awards.find(a => a._id === awardId)
      if (!award) {
        throw new Error('not found award');
      }

      if ((award.wonLotteryIds || []).length >= award.count) {
        throw new Error('this award is fully');
      }

      return { campaign, award }
    }

    static async setLuckyLottery(campaign, award, luckyLottery) {
      const awards = campaign.awards.map(a => (a._id === award._id ? { ...a, wonLotteryIds: [...a.wonLotteryIds, luckyLottery._id] } : a));

      await models.LotteryCampaigns.updateOne({ _id: campaign._id }, { awards });

      const voucher = await models.Vouchers.createVoucher({ campaignId: award.voucherCampaignId, ownerType: luckyLottery.ownerType, ownerId: luckyLottery.ownerId })
      await models.Lotteries.updateOne({ _id: luckyLottery._id }, { $set: { usedAt: new Date(), status: LOTTERY_STATUS.WON, voucherId: voucher._id, awardId: award._id } });
    }

    public static async multipleDoLottery({ campaignId, awardId, multiple }) {
      Array.from(Array(parseInt(multiple)), async (e, i) => {
        try {
          await this.doLottery({ campaignId, awardId });
        } catch (error) {
          throw new Error(error.message);
        }
        return true;
      });
    }

    public static async doLottery({ campaignId, awardId }) {
      const { campaign, award } = await this.validDoLottery(campaignId, awardId);

      const filter = { campaignId, status: LOTTERY_STATUS.NEW };
      const lotteriesCount = await models.Lotteries.find(filter).countDocuments();

      const random = Math.floor(randomBetween(0, lotteriesCount));

      const luckyLottery = await models.Lotteries.findOne(filter).skip(random).lean();

      if (!luckyLottery) {
        throw new Error('not found lucky lottery');
      }

      await this.setLuckyLottery(campaign, award, luckyLottery);

      return models.Lotteries.getLottery(luckyLottery._id);
    }

    public static async getNextChar({ campaignId, awardId, prevChars }) {
      const { campaign, award } = await this.validDoLottery(campaignId, awardId);

      const randomNumber = getRandomNumber(campaign.numberFormat);

      const nextChar = randomNumber.substring(prevChars.length, prevChars.length + 1);
      const afterChars = `${prevChars}${nextChar}`;
      const filter = {
        campaignId,
        status: LOTTERY_STATUS.NEW,
        formatNumber: new RegExp(`^${afterChars}.*`, "g")
      }

      const fitLotteriesCount = await models.Lotteries.find(filter).countDocuments();

      if (fitLotteriesCount === 1) {
        const luckyLottery = await models.Lotteries.findOne(filter) || {};

        await this.setLuckyLottery(campaign, award, luckyLottery);

        return {
          nextChar,
          afterChars,
          fitLotteriesCount,
          luckyLottery: await models.Lotteries.findOne({ _id: (luckyLottery as any)._id }).lean()
        }

      }

      const fitLotteries = await models.Lotteries.find(filter).limit(10).lean();

      return {
        nextChar,
        afterChars,
        fitLotteriesCount,
        fitLotteries
      }
    }
  };

  lotteryCampaignSchema.loadClass(LotteryCampaign);

  return lotteryCampaignSchema;
};
