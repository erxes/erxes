import { IUserDocument } from "erxes-api-shared/core-types";
import { fixNum, getPureDate, getTomorrow, graphqlPubsub } from "erxes-api-shared/utils";
import { now } from "mongoose";
import { IModels } from "~/connectionResolvers";
import { ADJ_INV_STATUSES, IAdjustInvDetailParams, IAdjustInventory, IAdjustInventoryDocument, ICommonAdjInvDetailInfo } from "../@types/adjustInventory";
import { JOURNALS, TR_STATUSES } from "../@types/constants";
import { ITransactionDocument, ITrDetail } from "../@types/transaction";

export const modifierWrapper = async (models: IModels, adjustInventory: IAdjustInventoryDocument, modifier: any, hasObj = false) => {
  const adjustId = adjustInventory._id;

  await models.AdjustInventories.updateAdjustInventory(adjustId, modifier);

  graphqlPubsub.publish(`accountingAdjustInventoryChanged:${adjustId}`, {
    accountingAdjustInventoryChanged: {
      ...adjustInventory,
      ...modifier
    },
  });

  if (hasObj) {
    return await models.AdjustInventories.getAdjustInventory(adjustId);
  }

  return;
}

export const checkValidDate = async (models: IModels, adjustInventory: IAdjustInventory) => {
  const date = getPureDate(adjustInventory.date);
  const afterAdjInvs = await models.AdjustInventories.find({ date: { $gte: date }, status: ADJ_INV_STATUSES.PUBLISH }).lean();

  if (afterAdjInvs.length) {
    throw new Error('Үүнээс хойш батлагдсан тохируулга байгаа учир энэ огноонд тохируулга үүсгэх шаардлагагүй.');
  }

  const lowBeforeAdjInvs = await models.AdjustInventories.find({ date: { $lt: date }, status: { $ne: ADJ_INV_STATUSES.PUBLISH } }).lean();
  if (lowBeforeAdjInvs.length) {
    throw new Error('Энэнээс урагш дутуу гүйцэтгэлтэй тохируулга байна. Түүнийг устгах эсвэл гүйцээж байж энэ огноонд тохируулга үүсгэнэ үү.');
  }

  const beforeAdjInv = await models.AdjustInventories.findOne({ date: { $lt: date }, status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean();

  let beginDate = beforeAdjInv?.date;
  if (!beginDate) {
    const firstTr = await models.Transactions.findOne({ date: { $lte: date }, 'details.productId': { $exists: true, $ne: '' }, status: { $in: TR_STATUSES.ACTIVE } }).sort({ date: 1 }).lean();
    beginDate = firstTr?.date;
  }

  if (!beginDate) {
    throw new Error('Үүнээс урагш гүйлгээ ч алга, тохируулга ч алга. Тиймээс тохируулах шаардлагагүй.');
  }

  return { beginDate, beforeAdjInv };
}

export const detailsClear = async (models: IModels, user: IUserDocument, adjustInventory: IAdjustInventoryDocument, date?: Date) => {
  const adjustId = adjustInventory._id;
  if (!date || !adjustInventory.beginDate || !adjustInventory.successDate) {
    const { beforeAdjInv } = await checkValidDate(models, adjustInventory);
    if (beforeAdjInv) {
      await models.AdjustInvDetails.copyAdjustInvDetails({ sourceAdjustId: beforeAdjInv._id, adjustId });
    }

    return await modifierWrapper(models, adjustInventory, { successDate: null, modifiedBy: user._id }, true);
  }

  if (!(date && ((adjustInventory.beginDate && adjustInventory.beginDate < date) || (adjustInventory.successDate && adjustInventory.successDate > date)))) {
    throw new Error('wrong date')
  }

  const details = await models.AdjustInvDetails.find({ adjustId }).lean();
  for (const detail of details) {
    const newInfos: ICommonAdjInvDetailInfo[] = (detail.infoPerDate || [])
      .filter(ip => ip.date < date)
      .sort((a, b) => a.date > b.date ? 1 : -1) || [];

    const lastInfo: ICommonAdjInvDetailInfo | undefined = newInfos[newInfos.length - 1];

    // update from lastInfoDate
    await models.AdjustInvDetails.updateOne({ _id: detail._id }, {
      $set: {
        ...detail,
        infoPerDate: newInfos,
        remainder: lastInfo?.remainder ?? 0,
        cost: lastInfo?.cost ?? 0,
        unitCost: lastInfo?.unitCost ?? 0,
        soonInCount: lastInfo?.soonInCount ?? 0,
        soonOutCount: lastInfo?.soonOutCount ?? 0,
      }
    });
  }
  return await modifierWrapper(models, adjustInventory, { successDate: date, modifiedBy: user._id }, true);
}

const recheckValidDate = async (models: IModels, adjustInventory, beginDate) => {
  if (!adjustInventory?.successDate) {
    return beginDate;
  }

  // yavaandaa logoos delete iig mun shalgah yum baina
  const betweenModifiedFirstTr = await models.Transactions.findOne({
    date: { $gte: beginDate, $lte: adjustInventory.successDate },
    'details.productId': { $exists: true, $ne: '' },
    $or: [
      { updatedAt: { $exists: false }, createdAt: { $gte: adjustInventory.checkedAt } },
      { updatedAt: { $gte: adjustInventory.checkedAt } },
    ]
  }).sort({ date: 1 }).lean();

  if (betweenModifiedFirstTr) {
    return betweenModifiedFirstTr.date;
  }

  return adjustInventory.successDate;
}

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

    if (!branchId || !departmentId || !productId || !accountId) {
      continue
    }

    const count = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));
    const amount = fixNum(records.reduce((sum, rec) => sum + (rec.details.amount ?? 0), 0));

    await models.AdjustInvDetails.increaseAdjustInvDetail({ adjustId, branchId, departmentId, accountId, productId, count, amount, multiplier })
  }
}

const calcInvTrs = async (models: IModels, { adjustId, beginDate, endDate, trFilter }: {
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
  return;
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

    if (!branchId || !departmentId || !productId || !accountId) {
      continue
    }

    const detailFilter = {
      productId, accountId,
      branchId, departmentId,
    }

    const sumCount = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));

    const adjustDetail = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });

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
        remainder -= fixNum(count ?? 0);
        cost -= newCost;

        // out - fix
        await models.Transactions.updateOne(
          { _id: rec._id },
          {
            $set: {
              'details.$[d].unitPrice': unitCost,
              'details.$[d].amount': newCost,
              sumDt: 0,
              sumCt: fixNum(rec.sumCt - amount + newCost),
            }
          },
          { arrayFilters: [{ 'd._id': { $eq: details._id } }] }
        );

        await fixRelatedMainJournal(models, { ptrId: rec.ptrId, excludeTrId: rec._id, oldAmount: amount, newAmount: newCost });

      } else {
        remainder -= fixNum(count ?? 0);
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

    if (!branchId || !departmentId || !productId || !accountId) {
      continue
    }

    const detailFilter = {
      productId, accountId,
      branchId, departmentId,
    }

    const sumCount = fixNum(records.reduce((sum, rec) => sum + (rec.details.count ?? 0), 0));

    const adjustDetail = await models.AdjustInvDetails.getAdjustInvDetail({ ...detailFilter, adjustId });

    let remainder = fixNum((adjustDetail?.remainder ?? 0));
    let cost = fixNum((adjustDetail?.cost ?? 0));
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

const fixInvTrs = async (models: IModels, {
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
  ]);
  await fixOutTrs(models, { adjustId, outAggrs });
}

export const adjustRunning = async (models: IModels, user: IUserDocument, { adjustInventory, beginDate, beforeAdjInv }: { adjustInventory: IAdjustInventoryDocument, beginDate: Date, beforeAdjInv?: IAdjustInventoryDocument | null }) => {
  try {
    let currentDate = await recheckValidDate(models, adjustInventory, beginDate);
    const date = adjustInventory.date;
    const adjustId = adjustInventory._id;

    await detailsClear(models, user, adjustInventory, currentDate);

    const trFilter = {
      'details.productId': { $exists: true, $ne: '' },
      'details.accountId': { $exists: true, $ne: '' },
      'branchId': { $exists: true, $ne: '' },
      'departmentId': { $exists: true, $ne: '' },
      status: { $in: TR_STATUSES.ACTIVE },
    }

    // cachees bolson uchir ene barag hereggui baih yostoi
    // if (currentDate < beginDate) {
    // await calcInvTrs(models, { adjustId, beginDate: beginDate, endDate: currentDate, trFilter }) // энэ хооронд бичилтийн өөрлөлт орохгүй тул бөөнд нь details ээ цэнэглэх зорилготой
    // }

    // өдөр бүрээр гүйлгээнүүдийг журналаар багцалж тооцож өртгийг зүгшрүүлж шаардлагатай бол гүйлгээг засч эндээсээ цэнэглэнэ
    while (currentDate < date) {
      const nextDate = getTomorrow(currentDate);

      try {
        await fixInvTrs(models, { adjustId, beginDate: currentDate, endDate: nextDate, trFilter });

        let bulkOps: Array<{
          updateOne: {
            filter: { _id: string };
            update: { $push: { infoPerDate: ICommonAdjInvDetailInfo } };
          };
        }> = [];

        // toCache
        let step = 0;
        const per = 1000;
        const summary = await models.AdjustInvDetails.find({ adjustId }).countDocuments();

        while (step * per <= summary) {
          bulkOps = [];
          const details = await models.AdjustInvDetails.find({ adjustId })
            .sort({ accountId: 1, branchId: 1, departmentId: 1, productId: 1 })
            .skip(step * per)
            .limit(step).lean();
          for (const detail of details) {
            bulkOps.push({
              updateOne: {
                filter: { _id: detail._id },
                update: {
                  $push: {
                    infoPerDate: {
                      date: currentDate,
                      remainder: detail.remainder,
                      cost: detail.cost,
                      unitCost: detail.unitCost,
                      soonInCount: detail.soonInCount,
                      soonOutCount: detail.soonOutCount,
                    }
                  }
                },
              },
            });
          }
          if (bulkOps.length) {
            await models.AdjustInvDetails.bulkWrite(bulkOps);
          }
          step++;
        }
        // end toCache

        await modifierWrapper(models, adjustInventory, {
          checkedAt: new Date(), successDate: nextDate
        })
      } catch (e) {
        const now = new Date();
        await modifierWrapper(models, adjustInventory, {
          error: e.message,
          checkedAt: now
        })
        break;
      }

      currentDate = nextDate;
    }

    await modifierWrapper(models, adjustInventory, {
      checkedAt: new Date(), status: ADJ_INV_STATUSES.COMPLETE, error: ''
    })
  } catch (e) {
    modifierWrapper(models, adjustInventory, { checkedDate: now, error: e.message, status: ADJ_INV_STATUSES.PROCESS })
  }
}