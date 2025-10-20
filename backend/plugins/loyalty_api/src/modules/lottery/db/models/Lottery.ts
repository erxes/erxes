import { ILottery, ILotteryDocument } from '@/lottery/@types/lottery';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { lotterySchema } from '../definitions/lottery';

export interface ILotteryModel extends Model<ILotteryDocument> {
  getLottery(_id: string): Promise<ILotteryDocument>;
  getLotteries(): Promise<ILotteryDocument[]>;
  createLottery(doc: ILottery): Promise<ILotteryDocument>;
  updateLottery(_id: string, doc: ILottery): Promise<ILotteryDocument>;
  removeLottery(LotteryId: string): Promise<{ ok: number }>;
}

export const loadLotteryClass = (models: IModels) => {
  class Lottery {
    /**
     * Retrieves lottery
     */
    public static async getLottery(_id: string) {
      const Lottery = await models.Lottery.findOne({ _id }).lean();

      if (!Lottery) {
        throw new Error('Lottery not found');
      }

      return Lottery;
    }

    /**
     * Retrieves all lotteries
     */
    public static async getLotteries(): Promise<ILotteryDocument[]> {
      return models.Lottery.find().lean();
    }

    /**
     * Create a lottery
     */
    public static async createLottery(
      doc: ILottery,
    ): Promise<ILotteryDocument> {
      return models.Lottery.create(doc);
    }

    /*
     * Update lottery
     */
    public static async updateLottery(_id: string, doc: ILottery) {
      return await models.Lottery.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove lottery
     */
    public static async removeLottery(LotteryId: string[]) {
      return models.Lottery.deleteOne({ _id: { $in: LotteryId } });
    }
  }

  lotterySchema.loadClass(Lottery);

  return lotterySchema;
};
