import { fixNum } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
import { ITrDetail } from '~/modules/accounting/@types/transaction';
import { SAFE_REMAINDER_STATUSES } from '~/modules/inventories/@types/constants';
import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';
import {
  ISafeRemainder,
  ISafeRemEditFields,
} from '~/modules/inventories/@types/safeRemainders';
import {
  safeRemainderDoTrs,
  safeRemainderUndoTrs,
  setSafeRemItems,
} from './utils';

const safeRemainderMutations = {
  safeRemainderAdd: async (
    _root: unknown,
    params: ISafeRemainder,
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.createRemainder(
      params,
      user._id,
    );

    await setSafeRemItems(subdomain, models, safeRemainder, user._id);
    return safeRemainder;
  },

  safeRemainderEdit: async (
    _root: unknown,
    params: ISafeRemEditFields & { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    return await models.SafeRemainders.updateRemainder(params, user._id);
  },

  safeRemainderRemove: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeSafeRemainders');

    // Delete safe remainder
    return models.SafeRemainders.removeRemainder(_id);
  },

  safeRemainderReCalc: async (
    _root: unknown,
    { _id }: { _id: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('can`t update, cause: status is published');
    }

    await setSafeRemItems(subdomain, models, safeRemainder, user._id);
    return 'success';
  },

  safeRemainderSubmit: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(_id);

    if (
      safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED ||
      safeRemainder.status === SAFE_REMAINDER_STATUSES.DONE
    ) {
      throw new Error('Already submited');
    }

    const { branchId, departmentId, date, productCategoryId } = safeRemainder;

    const afterSafeRems = await models.SafeRemainders.find({
      status: {
        $in: [SAFE_REMAINDER_STATUSES.PUBLISHED, SAFE_REMAINDER_STATUSES.DONE],
      },
      branchId,
      departmentId,
      productCategoryId,
      date: { $gt: date },
    }).lean();

    if (afterSafeRems.length) {
      throw new Error(
        'Cant publish cause has a after submited safe remainders',
      );
    }

    await models.SafeRemainders.updateOne(
      { _id },
      { $set: { status: SAFE_REMAINDER_STATUSES.DONE } },
    );
    return await models.SafeRemainders.getRemainder(_id);
  },

  safeRemainderCancel: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(_id);

    if (safeRemainder.status !== SAFE_REMAINDER_STATUSES.DONE) {
      throw new Error('status is not submitted');
    }

    const { branchId, departmentId, date, productCategoryId } = safeRemainder;

    const afterSafeRems = await models.SafeRemainders.find({
      status: {
        $in: [SAFE_REMAINDER_STATUSES.PUBLISHED, SAFE_REMAINDER_STATUSES.DONE],
      },
      branchId,
      departmentId,
      productCategoryId,
      date: { $gt: date },
    }).lean();

    if (afterSafeRems.length) {
      throw new Error(
        'Cant publish cause has a after submited safe remainders',
      );
    }

    await models.SafeRemainders.updateOne(
      { _id },
      { $set: { status: SAFE_REMAINDER_STATUSES.DRAFT } },
    );
    return await models.SafeRemainders.getRemainder(_id);
  },

  safeRemainderDoTr: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    const items: ISafeRemainderItemDocument[] =
      await models.SafeRemainderItems.find({ remainderId: _id }).lean();
    const {
      incomeRule,
      incomeTrId,
      outRule,
      outTrId,
      saleRule,
      saleTrId,
      costIncreaseRule,
      costDecreaseRule,
      costIncreaseTrId,
      costDecreaseTrId,
    } = safeRemainder;

    const { mainTr: oldIncomeTr, otherTrs: incomeOtherTrs } = incomeTrId
      ? await models.Transactions.getOriginTransactions(incomeTrId)
      : {};
    const { mainTr: oldOutTr, otherTrs: outOtherTrs } = outTrId
      ? await models.Transactions.getOriginTransactions(outTrId)
      : {};
    const { mainTr: oldSaleTr, otherTrs: saleOtherTrs } = saleTrId
      ? await models.Transactions.getOriginTransactions(saleTrId)
      : {};
    const { mainTr: oldCostIncreaseTr, otherTrs: costIncreaseOtherTrs } =
      costIncreaseTrId
        ? await models.Transactions.getOriginTransactions(costIncreaseTrId)
        : {};
    const { mainTr: oldCostDecreaseTr, otherTrs: costDecreaseOtherTrs } =
      costDecreaseTrId
        ? await models.Transactions.getOriginTransactions(costDecreaseTrId)
        : {};

    const incomeDetails: ITrDetail[] = [];
    const outDetails: ITrDetail[] = [];
    const saleDetails: ITrDetail[] = [];
    const costIncreaseDetails: ITrDetail[] = [];
    const costDecreaseDetails: ITrDetail[] = [];

    for (const item of items) {
      const { productId, preCount, count } = item;
      const activeCost = item.trInfo?.activeCost ?? 0;
      const targetCost = item.trInfo?.unitCost;
      const finalCost = targetCost ?? activeCost;
      const currentValue = fixNum(Math.max(0, preCount * activeCost), 6);
      const targetValue = fixNum(Math.max(0, count * finalCost), 6);
      let valueAfterQuantity = currentValue;

      if (preCount < count) {
        const incomeCount = count - preCount;
        const incomeAmount = fixNum(
          Math.max(0, targetValue - currentValue),
          6,
        );
        incomeDetails.push({
          accountId: incomeRule?.accountId ?? '',
          amount: incomeAmount,
          unitPrice: fixNum(incomeAmount / incomeCount, 6),
          productId,
          count: incomeCount,
        });
        valueAfterQuantity = fixNum(currentValue + incomeAmount, 6);
      } else if (preCount > count) {
        const outCount = preCount - count;
        valueAfterQuantity = fixNum(Math.max(0, count * activeCost), 6);

        if (item.trInfo?.isSale) {
          saleDetails.push({
            accountId: saleRule?.accountId ?? '',
            amount: fixNum(outCount * (item.trInfo?.unitPrice ?? 0), 6),
            unitPrice: fixNum(item.trInfo?.unitPrice ?? 0, 6),
            productId,
            count: outCount,
          });
        } else {
          outDetails.push({
            accountId: outRule?.accountId ?? '',
            amount: fixNum(outCount * activeCost, 6),
            unitPrice: fixNum(activeCost, 6),
            productId,
            count: outCount,
          });
        }
      }

      if (targetCost !== undefined) {
        const adjustmentDifference = fixNum(
          Math.max(-valueAfterQuantity, targetValue - valueAfterQuantity),
          6,
        );
        const adjustmentAmount = Math.abs(adjustmentDifference);
        const adjustmentDetail = {
          accountId:
            adjustmentDifference > 0
              ? (incomeRule?.accountId ?? '')
              : (outRule?.accountId ?? ''),
          amount: adjustmentAmount,
          unitPrice: count > 0 ? fixNum(adjustmentAmount / count, 6) : 0,
          productId,
          count: 0,
        };

        if (adjustmentDifference > 0 && adjustmentAmount > 0) {
          costIncreaseDetails.push(adjustmentDetail);
        } else if (adjustmentDifference < 0 && adjustmentAmount > 0) {
          costDecreaseDetails.push(adjustmentDetail);
        }
      }
    }

    if (costIncreaseDetails.length && !costIncreaseRule?.accountId) {
      throw new Error('Cost increase counterpart account is required');
    }
    if (costDecreaseDetails.length && !costDecreaseRule?.accountId) {
      throw new Error('Cost decrease counterpart account is required');
    }

    const newIncomeTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: incomeDetails,
      journal: JOURNALS.INV_INCOME,
      oldMainTr: oldIncomeTr,
      otherTrs: incomeOtherTrs,
      user,
    });
    const newOutTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: outDetails,
      journal: JOURNALS.INV_OUT,
      oldMainTr: oldOutTr,
      otherTrs: outOtherTrs,
      user,
    });
    const newSaleTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: saleDetails,
      journal: JOURNALS.INV_SALE,
      oldMainTr: oldSaleTr,
      otherTrs: saleOtherTrs,
      user,
      followInfos: {
        saleOutAccountId: safeRemainder.saleRule?.outAccountId,
        saleCostAccountId: safeRemainder.saleRule?.costAccountId,
      },
    });
    const newCostIncreaseTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: costIncreaseDetails,
      journal: JOURNALS.INV_JUSTIFY,
      side: TR_SIDES.DEBIT,
      counterAccountId: costIncreaseRule?.accountId,
      oldMainTr: oldCostIncreaseTr,
      otherTrs: costIncreaseOtherTrs,
      user,
    });
    const newCostDecreaseTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: costDecreaseDetails,
      journal: JOURNALS.INV_JUSTIFY,
      side: TR_SIDES.CREDIT,
      counterAccountId: costDecreaseRule?.accountId,
      oldMainTr: oldCostDecreaseTr,
      otherTrs: costDecreaseOtherTrs,
      user,
    });
    await models.SafeRemainders.updateOne(
      { _id: safeRemainder._id },
      {
        $set: {
          incomeTrId: newIncomeTrId,
          outTrId: newOutTrId,
          saleTrId: newSaleTrId,
          costIncreaseTrId: newCostIncreaseTrId,
          costDecreaseTrId: newCostDecreaseTrId,
          status: SAFE_REMAINDER_STATUSES.PUBLISHED,
        },
      },
    );
    return await models.SafeRemainders.getRemainder(_id);
  },

  safeRemainderUndoTr: async (
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    const {
      incomeTrId,
      outTrId,
      saleTrId,
      costIncreaseTrId,
      costDecreaseTrId,
    } = safeRemainder;
    await safeRemainderUndoTrs(models, incomeTrId);
    await safeRemainderUndoTrs(models, outTrId);
    await safeRemainderUndoTrs(models, saleTrId);
    await safeRemainderUndoTrs(models, costIncreaseTrId);
    await safeRemainderUndoTrs(models, costDecreaseTrId);
    await models.SafeRemainders.updateRemainder(
      {
        _id: safeRemainder._id,
        incomeTrId: '',
        outTrId: '',
        saleTrId: '',
        costIncreaseTrId: '',
        costDecreaseTrId: '',
        status: SAFE_REMAINDER_STATUSES.DONE,
      },
      user._id,
    );
    return await models.SafeRemainders.getRemainder(_id);
  },
};

export default safeRemainderMutations;
