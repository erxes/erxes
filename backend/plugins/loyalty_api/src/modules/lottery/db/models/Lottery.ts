import { ILottery, ILotteryDocument } from '@/lottery/@types/lottery';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_CHAR_SET_ADVANCED, LOYALTY_STATUSES } from '~/constants';
import { randomBetween } from '~/utils';
import { lotterySchema } from '../definitions/lottery';
import { randomInt } from 'crypto';

export interface ILotteryModel extends Model<ILotteryDocument> {
  getLottery(_id: string): Promise<ILotteryDocument>;
  createLottery(doc: ILottery, user: IUserDocument): Promise<ILotteryDocument>;
  updateLottery(
    _id: string,
    doc: ILottery,
    user: IUserDocument,
  ): Promise<ILotteryDocument>;
  removeLottery(LotteryId: string): Promise<{ ok: number }>;

  buyLottery(
    params: {
      campaignId: string;
      ownerType: string;
      ownerId: string;
      count?: number;
    },
    user: IUserDocument,
  ): Promise<ILotteryDocument>;

  doLottery(
    {
      campaignId,
      awardId,
    }: {
      campaignId: string;
      awardId: string;
    },
    user: IUserDocument,
  ): Promise<ILottery>;
  getNextChar(
    {
      campaignId,
      awardId,
      prevChars,
    }: {
      campaignId: string;
      awardId: string;
      prevChars: string;
    },
    user: IUserDocument,
  ): Promise<any>;
  multipleDoLottery(
    { campaignId, awardId, multiple },
    user: IUserDocument,
  ): Promise<any>;
}

export const loadLotteryClass = (models: IModels) => {
  class Lottery {
    public static async getLottery(_id: string) {
      const lottery = await models.Lottery.findOne({ _id });

      if (!lottery) {
        throw new Error('not found lottery rule');
      }

      return lottery;
    }

    public static async createLottery(doc: ILottery, user: IUserDocument) {
      const { campaignId, ownerType, ownerId, voucherCampaignId = '' } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create lottery, owner is undefined');
      }

      const lotteryCampaign = await models.Campaign.getCampaign(campaignId);

      const now = new Date();

      if (lotteryCampaign.startDate > now || lotteryCampaign.endDate < now) {
        throw new Error('Not create lottery, expired');
      }

      const number = this.generateLotteryNumber(
        lotteryCampaign.conditions?.numberFormat,
      );

      return await models.Lottery.create({
        campaignId,
        ownerType,
        ownerId,
        createdAt: now,
        number,
        status: LOYALTY_STATUSES.NEW,
        voucherCampaignId,
        userId: user._id,
      });
    }

    public static async updateLottery(
      _id: string,
      doc: ILottery,
      user: IUserDocument,
    ) {
      const { ownerType, ownerId, status } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Cannot update lottery: owner is undefined');
      }

      const spin = await models.Lottery.findOne({ _id }).lean();
      if (!spin) {
        throw new Error(`Lotteries ${_id} not found`);
      }
      const campaignId = spin.campaignId;

      await models.Campaign.getCampaign(campaignId);

      const now = new Date();

      return await models.Lottery.updateOne(
        { _id },
        {
          $set: {
            campaignId,
            ownerType,
            ownerId,
            modifiedAt: now,
            status,
            userId: user._id,
          },
        },
      );
    }

    public static async removeLotteries(_ids: string[]) {
      return models.Lottery.deleteMany({ _id: { $in: _ids } });
    }

    public static async generateLotteryNumber(number) {
      const re = /{ \[.-..?\] \* [0-9]* }/g;
      const items = number.match(/{ \[.-..?\] \* [0-9]* }|./g);

      const result: string[] = [];
      for (const item of items) {
        let str = item;

        if (re.test(str)) {
          const key = (str.match(/\[.-..?\]/g)[0] || '')
            .replace('[', '')
            .replace(']', '');
          let len = Number(
            (str.match(/ \* [0-9]* /g)[0] || '').substring(3) || '0',
          );
          if (isNaN(len)) {
            len = 8;
          }

          const charSet = LOYALTY_CHAR_SET_ADVANCED[key] || '0123456789';

          for (let i = 0; i < len; i++) {
            const position = randomInt(0, charSet.length);
            str = `${str}${charSet.substring(position, position + 1)}`;
          }
        }

        result.push(str);
      }

      return result.join('');
    }

    public static async buyLottery(
      params: {
        campaignId: string;
        ownerType: string;
        ownerId: string;
        count?: number;
      },
      user: IUserDocument,
    ) {
      const { campaignId, ownerType, ownerId, count = 1 } = params;

      if (!ownerId || !ownerType) {
        throw new Error('can not buy lottery, owner is undefined');
      }

      const lotteryCampaign = await models.Campaign.getCampaign(campaignId);

      if (!lotteryCampaign.conditions?.buyScore) {
        throw new Error('can not buy this lottery');
      }

      await models.Score.changeScore({
        ownerType,
        ownerId,
        change: -1 * lotteryCampaign.conditions?.buyScore * count,
        description: 'buy lottery',
        campaignId,
        action: 'buy',
        contentId: campaignId,
        contentType: 'campaign',
        createdBy: user._id,
      });

      return models.Lottery.createLottery(
        { campaignId, ownerType, ownerId },
        user,
      );
    }

    static async validDoLottery(campaignId, awardId) {
      const campaign = await (
        await models.Campaign.getCampaign(campaignId)
      ).toObject();
      const award = campaign.awards.find((a) => a._id === awardId);
      if (!award) {
        throw new Error('not found award');
      }

      if ((award.wonLotteryIds || []).length >= award.count) {
        throw new Error('this award is fully');
      }

      return { campaign, award };
    }

    static async setLuckyLottery(campaign, award, luckyLottery, user) {
      const awards = campaign.awards.map((a) =>
        a._id === award._id
          ? { ...a, wonLotteryIds: [...a.wonLotteryIds, luckyLottery._id] }
          : a,
      );

      await models.Campaign.updateOne({ _id: campaign._id }, { awards });

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

    public static async multipleDoLottery(
      { campaignId, awardId, multiple },
      user: IUserDocument,
    ) {
      Array.from(Array(parseInt(multiple)), async (e, i) => {
        try {
          await this.doLottery({ campaignId, awardId }, user);
        } catch (error) {
          throw new Error(error.message);
        }
        return true;
      });
    }

    public static async doLottery(
      { campaignId, awardId },
      user: IUserDocument,
    ) {
      const { campaign, award } = await this.validDoLottery(
        campaignId,
        awardId,
      );

      const filter = { campaignId, status: LOYALTY_STATUSES.NEW };
      const lotteriesCount = await models.Lottery.find(filter).countDocuments();

      const random = Math.floor(randomBetween(0, lotteriesCount));

      const luckyLottery = await models.Lottery.findOne(filter)
        .skip(random)
        .lean();

      if (!luckyLottery) {
        throw new Error('not found lucky lottery');
      }

      await this.setLuckyLottery(campaign, award, luckyLottery, user);

      return models.Lottery.getLottery(luckyLottery._id.toString());
    }

    public static async getNextChar(
      { campaignId, awardId, prevChars },
      user: IUserDocument,
    ) {
      const { campaign, award } = await this.validDoLottery(
        campaignId,
        awardId,
      );

      const randomNumber = await this.generateLotteryNumber(
        campaign.numberFormat,
      );

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

      const fitLotteriesCount = await models.Lottery.find(
        filter,
      ).countDocuments();

      if (fitLotteriesCount === 1) {
        const luckyLottery = (await models.Lottery.findOne(filter)) || {};

        await this.setLuckyLottery(campaign, award, luckyLottery, user);

        return {
          nextChar,
          afterChars,
          fitLotteriesCount,
          luckyLottery: await models.Lottery.findOne({
            _id: (luckyLottery as any)._id,
          }).lean(),
        };
      }

      const fitLotteries = await models.Lottery.find(filter).limit(10).lean();

      return {
        nextChar,
        afterChars,
        fitLotteriesCount,
        fitLotteries,
      };
    }
  }

  lotterySchema.loadClass(Lottery);

  return lotterySchema;
};
