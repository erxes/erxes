import { IModels } from "../connectionResolver";
import { IAdjustInvDetailParams } from "../models/definitions/adjustInventory";
import { JOURNALS } from "../models/definitions/constants";
import { ITransactionDocument, ITrDetail } from "../models/definitions/transaction";
import { fixNum } from "./utils";

const calcTrs = async (models: IModels, {
  adjustId, aggregateTrs, multiplier = 1
}: {
  adjustId: string,
  aggregateTrs: {
    _id: IAdjustInvDetailParams,
    records: ITransactionDocument & { details: ITrDetail }[]
  }[],
  beforeAdjInvId?: string,
  multiplier?: number
}) => {
  for (const trs of aggregateTrs) {
    const { _id, records } = trs;
    const { accountId, branchId, departmentId, productId } = _id;

    if (!branchId || !departmentId || productId || accountId) {
      continue
    }

    const count = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));
    const amount = fixNum(records.reduce((sum, rec) => sum + (rec.details.amount ?? 0), 0));

    await models.AdjustInvDetails.increaseAdjustInvDetail({ adjustId, branchId, departmentId, accountId, productId, count, amount, multiplier })
  }
}

export const calcInvTrs = async (models: IModels, { adjustId, beginDate, endDate, trFilter }: {
  adjustId: string,
  beginDate: Date,
  endDate: Date,
  trFilter: any,
  beforeAdjInvId?: string
}) => {
  const commonMatch: any = { date: { $gte: beginDate, $lt: endDate }, ...trFilter }
  const commonAggregates: any[] = [
    { $unwind: '$details' },
    { $sort: { updatedAt: 1 } },
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
  ]

  const incomeAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_INCOME } },
    ...commonAggregates
  ]);
  await calcTrs(models, { adjustId, aggregateTrs: incomeAggrs });

  const moveOutAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_MOVE } },
    ...commonAggregates
  ]);
  const moveInAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_MOVE_IN } },
    ...commonAggregates
  ]);
  await calcTrs(models, { adjustId, aggregateTrs: moveOutAggrs, multiplier: -1 });
  await calcTrs(models, { adjustId, aggregateTrs: moveInAggrs });

  const outAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_OUT } },
    ...commonAggregates
  ]);
  await calcTrs(models, { adjustId, aggregateTrs: outAggrs, multiplier: -1 });
}

// fix:
const fixRelatedMainJournal = async (models, { ptrId, excludeTrId, oldAmount, newAmount }: { ptrId: string, excludeTrId: string, oldAmount: number, newAmount: number }) => {

}

const fixOutTrs = async (models: IModels, {
  adjustId, outAggrs
}: {
  adjustId: string,
  outAggrs: {
    _id: IAdjustInvDetailParams,
    records: (ITransactionDocument & { details: ITrDetail })[]
  }[]
}) => {
  for (const outTrs of outAggrs) {
    const { _id, records } = outTrs;
    const { accountId, branchId, departmentId, productId } = _id;

    if (!branchId || !departmentId || productId || accountId) {
      continue
    }

    const detailFilter = {
      productId, accountId,
      branchId, departmentId,
    }

    const sumCount = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));

    let adjustDetail = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });

    let remainder = fixNum((adjustDetail.remainder ?? 0));
    let cost = fixNum((adjustDetail.cost ?? 0));
    const unitCost = fixNum(cost / (remainder ?? 1));

    if (remainder < sumCount) {
      const error = `Not enough stock for ${productId} in ${accountId} ${branchId} ${departmentId}`;
      await models.AdjustInvDetails.updateOne({ _id: adjustDetail._id }, { $set: { error } });
      throw new Error(error);
    }

    // bichleg bureer zalruulga hiine ingehdee haritstsan buyu orlogo talaa davhar shinechilsen, shinechilj baih burtee cache ee tsenegleh yostoi
    for (const rec of records) {
      const { details } = rec;
      const { count, amount } = details;
      const newCost = fixNum((count ?? 0) * unitCost);
      if (newCost !== amount) {
        remainder -= fixNum(count);
        cost -= newCost;

        // out - fix
        await models.Transactions.updateOne(
          { _id: rec._id },
          {
            $set: {
              'details.$[d].unitPrice': unitCost,
              'details.$[d].amount': newCost
            }
          },
          { arrayFilters: [{ 'd._id': { $eq: details._id } }] }
        );

        await fixRelatedMainJournal(models, { ptrId: rec.ptrId, excludeTrId: rec._id, oldAmount: amount, newAmount: newCost });

      } else {
        remainder -= fixNum(count);
        cost -= amount;
      }
    }

    // cache out adjustDetail
    await models.AdjustInvDetails.updateAdjustInvDetail({ adjustId, productId, accountId, branchId, departmentId, remainder, cost, unitCost })
  }
}

const fixMoveTrs = async (models: IModels, {
  adjustId, moveAggrs
}: {
  adjustId: string,
  moveAggrs: {
    _id: IAdjustInvDetailParams,
    records: (ITransactionDocument & { details: ITrDetail })[]
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

    const sumCount = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));

    let adjustDetail = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });

    let remainder = fixNum((adjustDetail.remainder ?? 0));
    let cost = fixNum((adjustDetail.cost ?? 0));
    const unitCost = fixNum(cost / (remainder ?? 1));

    if (remainder < sumCount) {
      const error = `Not enough stock for ${productId} in ${accountId} ${branchId} ${departmentId}`;
      await models.AdjustInvDetails.updateOne({ _id: adjustDetail._id }, { $set: { error } });
      throw new Error(error);
    }

    // bichleg bureer zalruulga hiine ingehdee haritstsan buyu orlogo talaa davhar shinechilsen, shinechilj baih burtee cache ee tsenegleh yostoi
    for (const rec of records) {
      const { details } = rec;
      const { count, amount, follows, followInfos } = details;
      const newCost = fixNum((count ?? 0) * unitCost);

      const moveInTrId = rec.follows?.find(f => f.type === 'moveIn');
      const moveInId = follows?.find(f => f.type === 'moveIn')?.id;
      const moveInRec = await models.Transactions.aggregate([
        { $match: { _id: moveInTrId } },
        { $unwind: '$details' },
        { $match: { 'details._id': moveInId } },
      ])[0];

      if (!moveInTrId || !moveInId || !moveInRec) {
        throw new Error(`MoveIn not found for ${rec.parentId}`);
      }

      if (newCost !== amount) {
        const moveInCost = fixNum(newCost + (followInfos?.perCost ?? 0));

        remainder -= fixNum(count);
        cost -= newCost;

        // out - fix
        await models.Transactions.updateOne(
          { _id: rec._id },
          {
            $set: {
              'details.$[d].unitPrice': unitCost,
              'details.$[d].amount': newCost
            }
          },
          { arrayFilters: [{ 'd._id': { $eq: details._id } }] }
        );

        // in - Fix
        await models.Transactions.updateOne(
          { _id: moveInTrId },
          {
            $set: {
              'details.$[d].unitPrice': unitCost,
              'details.$[d].amount': moveInCost
            }
          },
          { arrayFilters: [{ 'd._id': { $eq: moveInId } }] }
        );

        // cache move in adjustDetail
        await models.AdjustInvDetails.increaseAdjustInvDetail({
          adjustId,
          productId,
          accountId: moveInRec.details.accountId,
          branchId: moveInRec.branchId,
          departmentId: moveInRec.departmentId,
          count: moveInRec.detail.count,
          amount: moveInCost,
          multiplier: 1
        });
      } else {
        remainder -= fixNum(count);
        cost -= amount;

        // cache move in adjustDetail
        await models.AdjustInvDetails.increaseAdjustInvDetail({
          adjustId,
          productId,
          accountId: moveInRec.details.accountId,
          branchId: moveInRec.branchId,
          departmentId: moveInRec.departmentId,
          count: moveInRec.detail.count,
          amount: moveInRec.details.amount,
          multiplier: 1
        });
      }
    }

    // cache move out adjustDetail
    await models.AdjustInvDetails.updateAdjustInvDetail({ adjustId, productId, accountId, branchId, departmentId, remainder, cost, unitCost })
  }
  return {}
}

export const fixInvTrs = async (models: IModels, {
  adjustId, beginDate, endDate, trFilter
}: {
  adjustId: string,
  beginDate: Date,
  endDate: Date,
  trFilter: any,
}) => {
  const commonMatch: any = { date: { $gte: beginDate, $lt: endDate }, ...trFilter }
  const commonAggregates: any[] = [
    { $unwind: '$details' },
    { $sort: { updatedAt: 1 } },
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
  ]

  const incomeAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_INCOME } },
    ...commonAggregates
  ]);
  await calcTrs(models, { adjustId, aggregateTrs: incomeAggrs });

  const moveOutAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_MOVE } },
    ...commonAggregates
  ]);
  await fixMoveTrs(models, { adjustId, moveAggrs: moveOutAggrs });

  const outAggrs = await models.Transactions.aggregate([
    { $match: { ...commonMatch, journal: JOURNALS.INV_OUT } },
    ...commonAggregates
  ])
  await fixOutTrs(models, { adjustId, outAggrs })
}
