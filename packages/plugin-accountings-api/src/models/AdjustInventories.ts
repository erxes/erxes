import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { adjustInventoriesSchema, IAdjustInventory, IAdjustInventoryDocument, adjustInvDetailsSchema, IAdjustInvDetail, IAdjustInvDetailDocument, ADJ_INV_STATUSES, IAdjustInvDetailParamsId, IAdjustInvDetailParams } from './definitions/adjustInventory';
import { getFullDate } from '@erxes/api-utils/src';
import { JOURNALS, TR_SIDES } from './definitions/constants';
import { fixNum } from '../utils/utils';

export interface IAdjustInventoriesModel extends Model<IAdjustInventoryDocument> {
  getAdjustInventory(_id: string): Promise<IAdjustInventoryDocument>;
  createAdjustInventory(doc: IAdjustInventory): Promise<IAdjustInventory>;
  updateAdjustInventory(_id: string, doc: IAdjustInventory): Promise<IAdjustInventory>;
  removeAdjustInventory(_id: string): Promise<string>;
}

export const loadAdjustInventoriesClass = (models: IModels, subdomain: string) => {
  class AdjustInventories {
    public static async getAdjustInventory(_id: string) {
      const adjusting = await models.AdjustInventories.findOne({ _id }).lean();
      if (!adjusting) {
        throw new Error('Adjusting not found');
      }
      return adjusting;
    }

    public static async createAdjustInventory(doc: IAdjustInventory) {
      doc.date = getFullDate(doc.date)
      return models.AdjustInventories.create({ ...doc, createdAt: new Date() });
    }

    public static async updateAdjustInventory(_id: string, doc: IAdjustInventory) {
      const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
      await models.AdjustInventories.updateOne({ _id }, { $set: { ...doc, updatedAt: new Date() } });
      return await models.AdjustInventories.getAdjustInventory(_id);
    }

    public static async removeAdjustInventory(_id: string) {
      return await models.AdjustInventories.deleteOne({ _id });
    }
  }

  adjustInventoriesSchema.loadClass(AdjustInventories);

  return adjustInventoriesSchema;
};

export interface IAdjustInvDetailsModel extends Model<IAdjustInvDetailDocument> {
  getAdjustInvDetail(args: IAdjustInvDetailParamsId): Promise<IAdjustInvDetailDocument>;
  getAdjustInvDetailInfo(args: IAdjustInvDetailParamsId): Promise<IAdjustInvDetail>;
  copyAdjustInvDetails(args: { sourceAdjustId: string; adjustId: string }): Promise<void>;
  cleanAdjustInvDetails(args: { adjustId: string }): Promise<void>;
  updateAdjustInvDetail(args: IAdjustInvDetail): Promise<IAdjustInvDetail | void>;
  increaseAdjustInvDetail(args: IAdjustInvDetailParamsId & {
    count: number, amount: number, adjustDetail?: IAdjustInvDetailDocument, multiplier?: number, hasResp?: boolean
  }): Promise<IAdjustInvDetail | void>
}

export const loadAdjustInvDetailsClass = (models: IModels, subdomain: string) => {
  // нэг publish statustai adjustInventory ni bolomjit uldegdel buhii buh baraag barishil bureer hadgalna,
  // shineer adjInv uusgehed umnuhuus copy + calc + fix - clean tootsoo hiine ingesneer shine ni mun l buhii baraa ni bolomjit bairshil burder baina gesen ug
  // tegeheer uldegdelgui baij baigaad odoo l uldegdeltee bolj bui baraa l detail deer shineer nemegdene
  // busad uyed update hiigdej tootsogdono
  // hamgiin suuld publish bolgohdoo uldegdelgui barishiliin baraag tseverlej 0lene buyu 0 baigaag ustgana
  // tegeheer copydood ehleh uchir tuhain adjInv d edetail baihgui l bol 0 baisiin baina gej tootsohod boloh ni
  class AdjustInvDetails {
    public static async getAdjustInvDetail({ productId, accountId, departmentId, branchId, adjustId }: IAdjustInvDetailParamsId) {
      const detail = await models.AdjustInvDetails.findOne({ adjustId, productId, accountId, branchId, departmentId }).lean()

      if (detail) {
        return detail;
      }

      return {
        adjustId,
        productId,
        accountId,
        branchId,
        departmentId,
        remainder: 0,
        cost: 0,
        unitCost: 0
      }
    }

    public static async copyAdjustInvDetails({ sourceAdjustId, adjustId }: { sourceAdjustId: string; adjustId: string }) {
      await models.AdjustInvDetails.deleteMany({ adjustId });

      const preAdjustDetailsCount = await models.AdjustInvDetails.find({ adjustId: sourceAdjustId }).countDocuments();

      let step = 0;
      let per = 1000;

      while (step * per <= preAdjustDetailsCount) {
        const skip = step * per;
        const sourceDetails = await models.AdjustInvDetails.find({
          adjustId: sourceAdjustId
        }).skip(skip).limit(per).lean();

        await models.AdjustInvDetails.insertMany(sourceDetails?.map(sd => ({
          ...sd,
          _id: nanoid()
        })));

        step++
      }
    }

    public static async cleanAdjustInvDetails({ adjustId }: { adjustId: string }) {
      await models.AdjustInvDetails.deleteMany({ adjustId, remainder: { $eq: 0 }, cost: { $eq: 0 } });
    }

    public static async updateAdjustInvDetail(args: IAdjustInvDetail & { hasResp: boolean }) {
      const { adjustId, productId, accountId, branchId, departmentId, hasResp } = args;
      const oldDetail = await models.AdjustInvDetails.findOne({ adjustId, productId, accountId, branchId, departmentId }).lean();
      if (oldDetail) {
        await models.AdjustInvDetails.updateOne({ _id: oldDetail._id }, { $set: { ...args } });
        if (hasResp) {
          return await models.AdjustInvDetails.findOne({ _id: oldDetail._id });
        }
      }

      const newDetail = await models.AdjustInvDetails.create({ ...args });
      if (hasResp) {
        return newDetail;
      }
    }

    public static async increaseAdjustInvDetail({
      adjustId, productId, accountId, branchId, departmentId, count, amount, adjustDetail, multiplier, hasResp
    }: IAdjustInvDetailParamsId & {
      count: number, amount: number, adjustDetail?: IAdjustInvDetailDocument, multiplier?: number, hasResp?: boolean
    }) {
      if (!adjustDetail) {
        adjustDetail = await models.AdjustInvDetails.getAdjustInvDetail({ adjustId, productId, accountId, branchId, departmentId, })
      }

      if (!multiplier) {
        multiplier = 1;
      }

      const remainder = fixNum((adjustDetail.remainder ?? 0) + multiplier * count);
      const cost = fixNum((adjustDetail.cost ?? 0) + multiplier * amount);
      const unitCost = fixNum(cost / (remainder ?? 1));

      if (adjustDetail?._id) {
        await models.AdjustInvDetails.updateOne({ _id: adjustDetail._id }, {
          $set: {
            ...adjustDetail,
            updatedAt: new Date(),
            remainder,
            cost,
            unitCost,
          }
        });
      } else {
        adjustDetail = await models.AdjustInvDetails.create({
          ...adjustDetail,
          adjustId,
          remainder,
          cost,
          unitCost: fixNum(cost / (remainder ?? 1)),
        });
      }

      if (hasResp) {
        return await models.AdjustInvDetails.findOne({ _id: adjustDetail._id })
      }
    }

    public static async getAdjustInvDetailInfo({ productId, accountId, departmentId, branchId, adjustId }: IAdjustInvDetailParamsId) {
      // let adjusting = await models.AdjustInvDetails.getAdjustInvDetail({ adjustId, productId, accountId, departmentId, branchId });
      if (adjustId) {
        return await models.AdjustInvDetails.getAdjustInvDetail({ adjustId, productId, accountId, branchId, departmentId });
      }

      const lastPublishAdjust = await models.AdjustInventories.findOne({ status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean()
      adjustId = lastPublishAdjust?._id ?? '';

      if (adjustId) {
        return await models.AdjustInvDetails.getAdjustInvDetail({ adjustId, productId, accountId, branchId, departmentId });
      }

      const trAggs = await models.Transactions.aggregate([
        {
          $match: {
            journal: { $in: JOURNALS.ALL_REAL_INV },
            'details.productId': productId,
            'details.accountId': accountId,
            branchId,
            departmentId
          }
        },
        { $sort: { date: 1 } },
        { $unwind: '$details' },
        { $match: { 'details.productId': productId } },
        { $group: { _id: { side: '$detail.side' }, remainder: { $sum: '$details.count' }, cost: { $sum: '$detail.amount' } } }
      ])

      const remainder = fixNum(trAggs.map(ag => ag._id === TR_SIDES.DEBIT ? ag.remainder : -1 * ag.remainder));
      const cost = fixNum(trAggs.map(ag => ag._id === TR_SIDES.DEBIT ? ag.cost : -1 * ag.cost));

      return {
        adjustId: '',
        productId,
        accountId,
        branchId,
        departmentId,
        remainder,
        cost,
        unitCost: fixNum(cost / (remainder || 1))
      };
    }
  }

  adjustInvDetailsSchema.loadClass(AdjustInvDetails);
  return adjustInvDetailsSchema;

}