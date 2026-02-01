import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_STATUSES } from '~/constants';
import { ILottery } from '@/lottery/@types/lottery';
import {
  ILotteryCampaign,
  ILotteryCampaignDocument,
} from '@/lottery/@types/lotteryCampaign';
import { lotteryCampaignSchema } from '../definitions/lotteryCampaign';
import { randomBetween } from '~/utils';

export interface ILotteryCampaignModel
  extends Model<ILotteryCampaignDocument> {
  getLotteryCampaign(_id: string): Promise<ILotteryCampaignDocument>;

  createLotteryCampaign(
    doc: ILotteryCampaign,
    user: IUserDocument,
  ): Promise<ILotteryCampaignDocument>;

  updateLotteryCampaign(
    _id: string,
    doc: Partial<ILotteryCampaign>,
    user: IUserDocument,
  ): Promise<ILotteryCampaignDocument>;

  removeLotteryCampaign(_id: string): Promise<{ ok: number }>;

  doLottery(
    params: { campaignId: string; awardId: string },
    user: IUserDocument,
  ): Promise<ILottery>;

  multipleDoLottery(
    params: { campaignId: string; awardId: string; multiple: number },
    user: IUserDocument,
  ): Promise<any>;

  getNextChar(
    params: { campaignId: string; awardId: string; prevChars: string },
    user: IUserDocument,
  ): Promise<any>;
}

export const loadLotteryCampaignClass = (models: IModels) => {
  class LotteryCampaign {
    /* -------------------- basic CRUD -------------------- */

    public static async getLotteryCampaign(_id: string) {
      const campaign = await models.LotteryCampaign.findOne({ _id });

      if (!campaign) {
        throw new Error('Lottery campaign not found');
      }

      return campaign;
    }

    public static async createLotteryCampaign(
      doc: ILotteryCampaign,
      user: IUserDocument,
    ) {
      const now = new Date();

      return models.LotteryCampaign.create({
        ...doc,
        status: doc.status || LOYALTY_STATUSES.ACTIVE,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
      });
    }

    public static async updateLotteryCampaign(
      _id: string,
      doc: Partial<ILotteryCampaign>,
      user: IUserDocument,
    ) {
      await this.getLotteryCampaign(_id);

      return models.LotteryCampaign.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            updatedAt: new Date(),
            updatedBy: user._id,
          },
        },
      );
    }

    public static async removeLotteryCampaign(_id: string) {
      return models.LotteryCampaign.deleteOne({ _id });
    }

    /* -------------------- lottery logic -------------------- */

    static async validDoLottery(campaignId: string, awardId: string) {
      const campaign = (await this.getLotteryCampaign(campaignId)).toObject();

      const award = campaign.awards.find((a) => a._id === awardId);

      if (!award) {
        throw new Error('Award not found');
      }

      if ((award.wonLotteryIds || []).length >= award.count) {
        throw new Error('This award is fully claimed');
      }

      return { campaign, award };
    }

    static async setLuckyLottery(
      campaign,
      award,
      luckyLottery,
      user: IUserDocument,
    ) {
      const awards = campaign.awards.map((a) =>
        a._id === award._id
          ? { ...a, wonLotteryIds: [...a.wonLotteryIds, luckyLottery._id] }
          : a,
      );

      await models.LotteryCampaign.updateOne(
        { _id: campaign._id },
        { awards },
      );

      const voucher = await models.Voucher.createVoucher(
        {
          campaignId: award.voucherCampaignId,
          ownerType: luckyLottery.ownerType,
          ownerId: luckyLottery.ownerId,
        },
        user,
      );

      await models.Lottery.updateOne(
        { _id: luckyLottery._id },
        {
          $set: {
            usedAt: new Date(),
            status: LOYALTY_STATUSES.WON,
            voucherId: voucher._id,
            awardId: award._id,
          },
        },
      );
    }

    public static async doLottery(
      { campaignId, awardId },
      user: IUserDocument,
    ) {
      const { campaign, award } = await this.validDoLottery(
        campaignId,
        awardId,
      );

      const filter = {
        campaignId,
        status: LOYALTY_STATUSES.NEW,
      };

      const count = await models.Lottery.find(filter).countDocuments();
      const random = Math.floor(randomBetween(0, count));

      const luckyLottery = await models.Lottery.findOne(filter)
        .skip(random)
        .lean();

      if (!luckyLottery) {
        throw new Error('Lucky lottery not found');
      }

      await this.setLuckyLottery(campaign, award, luckyLottery, user);

      return models.Lottery.getLottery(luckyLottery._id.toString());
    }

    public static async multipleDoLottery(
      { campaignId, awardId, multiple },
      user: IUserDocument,
    ) {
      Array.from(Array(Number.parseInt(multiple)), async () => {
        await this.doLottery({ campaignId, awardId }, user);
        return true;
      });
    }

    public static async getNextChar(
      { campaignId, awardId, prevChars },
      user: IUserDocument,
    ) {
      const { campaign, award } = await this.validDoLottery(
        campaignId,
        awardId,
      );

      const randomNumber = campaign.numberFormat;
      const nextChar = randomNumber.substring(
        prevChars.length,
        prevChars.length + 1,
      );

      const afterChars = `${prevChars}${nextChar}`;

      const filter = {
        campaignId,
        status: LOYALTY_STATUSES.NEW,
        formatNumber: new RegExp(`^${afterChars}.*`, 'g'),
      };

      const count = await models.Lottery.find(filter).countDocuments();

      if (count === 1) {
        const luckyLottery = await models.Lottery.findOne(filter).lean();

        await this.setLuckyLottery(campaign, award, luckyLottery, user);

        return {
          nextChar,
          afterChars,
          fitLotteriesCount: count,
          luckyLottery,
        };
      }

      return {
        nextChar,
        afterChars,
        fitLotteriesCount: count,
        fitLotteries: await models.Lottery.find(filter).limit(10).lean(),
      };
    }
  }

  lotteryCampaignSchema.loadClass(LotteryCampaign);
  return lotteryCampaignSchema;
};
