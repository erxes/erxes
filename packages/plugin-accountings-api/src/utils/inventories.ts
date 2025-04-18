import { IModels } from "../connectionResolver";
import mod from "../graphql";
import { IAdjustInvDetailDocument, IAdjustInventoryDocument } from "../models/definitions/adjustInventory";
import { JOURNALS, TR_SIDES } from "../models/definitions/constants";
import { ITransaction, ITransactionDocument, ITrDetail } from "../models/definitions/transaction";
import { fixNum } from "./utils";

export const cleanPreCalced = async (models, adjustInventory) => {
  await models.AdjustInvDetails.deleteMany({ adjustId: adjustInventory._id });
}

export const calcInvTrs = async (models) => {

}

export const fixInvTrs = async (models: IModels, {
  adjustId, beginDate, endDate, trFilter, beforeAdjInv
}: {
  adjustId: string,
  beginDate: Date,
  endDate: Date,
  trFilter: any,
  beforeAdjInv: IAdjustInventoryDocument | null
}) => {
  const incomeAggrs = await models.Transactions.aggregate([
    { $match: { date: { $gte: beginDate, $lt: endDate }, journal: JOURNALS.INV_INCOME, ...trFilter } },
    { $unwind: '$details' },
    { $sort: { modifiedAt: 1 } },
    {
      $group: {
        _id: {
          accountId: '$details.accountId',
          branchId: '$branchId',
          departmentId: '$departmentId',
          productId: '$details.productId'
        },
        records: { $push: '$$ROOT' },
      }
    }
  ]);

  await calcIncomeTrs(models, { adjustId, incomeAggrs, beforeAdjInvId: beforeAdjInv?._id });

  const moveAggrs = await models.Transactions.aggregate([
    { $match: { date: { $gte: beginDate, $lt: endDate }, journal: JOURNALS.INV_MOVE, 'details.side': TR_SIDES.CREDIT, ...trFilter } },
    { $unwind: '$details' },
    { $sort: { modifiedAt: 1 } },
    {
      $group: {
        _id: {
          accountId: '$details.accountId',
          branchId: '$branchId',
          departmentId: '$departmentId',
          productId: '$details.productId'
        },
        records: { $push: '$$ROOT' },
      }
    }
  ]);
  await calcMoveTrs(models, { adjustId, moveAggrs, beforeAdjInvId: beforeAdjInv?._id });
}

export const calcIncomeTrs = async (models: IModels, {
  adjustId, beforeAdjInvId, incomeAggrs
}: {
  adjustId: string,
  incomeAggrs: {
    _id: { accountId: string, branchId: string, departmentId: string, productId: string },
    records: ITransactionDocument & { details: ITrDetail }[]
  }[],
  beforeAdjInvId?: string
}) => {
  for (const incomeTrs of incomeAggrs) {
    const { _id, records } = incomeTrs;
    const { accountId, branchId, departmentId, productId } = _id;

    if (!branchId || !departmentId || productId || accountId) {
      continue
    }

    const detailFilter = {
      productId, accountId,
      branchId, departmentId,
    }

    const sumCount = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));
    const sumCost = fixNum(records.reduce((sum, rec) => sum + (rec.details.amount ?? 0), 0));

    const adjusting = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });

    if (adjusting?._id) {
      const remainder = fixNum((adjusting.remainder ?? 0) + sumCount);
      const cost = fixNum((adjusting.cost ?? 0) + sumCost);

      await models.AdjustInvDetails.updateOne({ _id: adjusting._id }, {
        $set: {
          ...adjusting,
          modifiedAt: new Date(),
          remainder,
          cost,
          unitCost: fixNum(cost / (remainder ?? 1)),
        }
      });
    } else {
      let beforeDetail = await models.AdjustInvDetails.getAdjustInvDetail({
        ...detailFilter, adjustId: beforeAdjInvId
      });

      if (!beforeDetail._id) {
        beforeDetail = {
          adjustId,
          productId,
          accountId,
          branchId,
          departmentId,
          remainder: 0,
          cost: 0,
          unitCost: 0,
          soonInCount: 0,
          soonOutCount: 0,
          createdAt: new Date(),
          modifiedAt: new Date()
        } as IAdjustInvDetailDocument
      }

      const remainder = fixNum((beforeDetail.remainder ?? 0) + sumCount);
      const cost = fixNum((beforeDetail.cost ?? 0) + sumCost);

      await models.AdjustInvDetails.create({
        ...beforeDetail,
        adjustId,
        remainder,
        cost,
        unitCost: fixNum(cost / (remainder ?? 1)),
      });
    }
  }
}

export const calcMoveTrs = async (models: IModels, {
  adjustId, beforeAdjInvId, moveAggrs
}: {
  adjustId: string,
  moveAggrs: {
    _id: { accountId: string, branchId: string, departmentId: string, productId: string },
    records: ITransactionDocument & { details: ITrDetail }[]
  }[],
  beforeAdjInvId?: string
}) => {
  for (const outcomeTrs of moveAggrs) {
    const { _id, records } = outcomeTrs;
    const { accountId, branchId, departmentId, productId } = _id;

    if (!branchId || !departmentId || productId || accountId) {
      continue
    }

    const detailFilter = {
      productId, accountId,
      branchId, departmentId,
    }

    const adjusting = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });


    if (adjusting?._id) {
      const remainder = fixNum((adjusting.remainder ?? 0));
      const cost = fixNum((adjusting.cost ?? 0));

      await models.AdjustInvDetails.updateOne({ _id: adjusting._id }, {
        $set: {
          ...adjusting,
          modifiedAt: new Date(),
          remainder,
          cost,
          unitCost: fixNum(cost / (remainder ?? 1)),
        }
      });
    } else {
      let beforeDetail = await models.AdjustInvDetails.getAdjustInvDetail({
        ...detailFilter, adjustId: beforeAdjInvId
      });

      if (!beforeDetail._id) {
        beforeDetail = {
          adjustId,
          productId,
          accountId,
          branchId,
          departmentId,
          remainder: 0,
          cost: 0,
          unitCost: 0,
          soonInCount: 0,
          soonOutCount: 0,
          createdAt: new Date(),
          modifiedAt: new Date()
        } as IAdjustInvDetailDocument
      }

      const remainder = fixNum((beforeDetail.remainder ?? 0));
      const cost = fixNum((beforeDetail.cost ?? 0));

      await models.AdjustInvDetails.create({
        ...beforeDetail,
        adjustId,
        remainder,
        cost,
        unitCost: fixNum(cost / (remainder ?? 1)),
      });
    }
  }
}