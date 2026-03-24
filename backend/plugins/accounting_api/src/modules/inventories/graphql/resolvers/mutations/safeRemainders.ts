import { fixNum } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
import { ITrDetail } from '~/modules/accounting/@types/transaction';
import { SAFE_REMAINDER_STATUSES } from '~/modules/inventories/@types/constants';
import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';
import {
  ISafeRemainder,
  ISafeRemainderTrRule,
} from '~/modules/inventories/@types/safeRemainders';
import {
  safeRemainderDoTrs,
  safeRemainderUndoTrs,
  updateLiveRemainders,
} from './utils';

const safeRemainderMutations = {
  safeRemainderAdd: async (
    _root: any,
    params: ISafeRemainder,
    { models, subdomain, user }: IContext,
  ) => {
    return await models.SafeRemainders.createRemainder(
      subdomain,
      params,
      user._id,
    );
  },

  safeRemainderEdit: async (
    _root: any,
    params: {
      _id: string;
      description?: string;
      incomeRule?: ISafeRemainderTrRule;
      outRule?: ISafeRemainderTrRule;
      saleRule?: ISafeRemainderTrRule;
    },
    { models, subdomain, user }: IContext,
  ) => {
    return await models.SafeRemainders.updateRemainder(
      subdomain,
      params,
      user._id,
    );
  },

  safeRemainderRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    // Delete safe remainder
    return models.SafeRemainders.removeRemainder(_id);
  },

  safeRemainderReCalc: async (
    _root: any,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('can`t update, cause: status is published');
    }

    const items: ISafeRemainderItemDocument[] =
      await models.SafeRemainderItems.find({ remainderId: _id }).lean();

    const result = await updateLiveRemainders({
      subdomain,
      models,
      branchId: safeRemainder.branchId,
      departmentId: safeRemainder.departmentId,
      productIds: items.map((item) => item.productId),
    });

    await models.SafeRemainderItems.bulkWrite(
      result.map((rem) => ({
        updateOne: {
          filter: { remainderId: _id, productId: rem.productId },
          update: { preCount: rem.count },
        },
      })),
    );

    return 'success';
  },

  safeRemainderSubmit: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
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
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
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
    _root: any,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    const items: ISafeRemainderItemDocument[] =
      await models.SafeRemainderItems.find({ remainderId: _id }).lean();
    const { incomeRule, incomeTrId, outRule, outTrId, saleRule, saleTrId } =
      safeRemainder;

    const { mainTr: oldIncomeTr, otherTrs: incomeOtherTrs } = incomeTrId
      ? await models.Transactions.getOriginTransactions(incomeTrId)
      : {};
    const { mainTr: oldOutTr, otherTrs: outOtherTrs } = outTrId
      ? await models.Transactions.getOriginTransactions(outTrId)
      : {};
    const { mainTr: oldSaleTr, otherTrs: saleOtherTrs } = saleTrId
      ? await models.Transactions.getOriginTransactions(saleTrId)
      : {};

    const incomeDetails: ITrDetail[] = [];
    const outDetails: ITrDetail[] = [];
    const saleDetails: ITrDetail[] = [];

    for (const item of items) {
      const { productId, preCount, count } = item;
      if (preCount === count) {
        continue;
      }

      if (preCount < count) {
        const incomeCount = count - preCount;
        incomeDetails.push({
          accountId: incomeRule?.accountId ?? '',
          side: TR_SIDES.DEBIT,
          amount: fixNum(incomeCount * (item.trInfo?.unitCost ?? 0), 6),
          productId,
          count: incomeCount,
        });
        continue;
      }

      const outCount = preCount - count;
      if (item.trInfo?.isSale) {
        saleDetails.push({
          accountId: saleRule?.accountId ?? '',
          side: TR_SIDES.CREDIT,
          amount: fixNum(outCount * (item.trInfo?.salePrice ?? 0), 6),
          productId,
          count: outCount,
        });
        continue;
      }

      outDetails.push({
        accountId: outRule?.accountId ?? '',
        side: TR_SIDES.CREDIT,
        amount: fixNum(outCount * (item.trInfo?.unitCost ?? 0), 6),
        productId,
        count: outCount,
      });
    }

    const newIncomeTrId = await safeRemainderDoTrs(
      models,
      safeRemainder,
      incomeDetails,
      JOURNALS.INV_INCOME,
      oldIncomeTr,
      incomeOtherTrs,
      user,
    );
    const newOutTrId = await safeRemainderDoTrs(
      models,
      safeRemainder,
      outDetails,
      JOURNALS.INV_OUT,
      oldOutTr,
      outOtherTrs,
      user,
    );
    const newSaleTrId = await safeRemainderDoTrs(
      models,
      safeRemainder,
      saleDetails,
      JOURNALS.INV_SALE,
      oldSaleTr,
      saleOtherTrs,
      user,
    );
    await models.SafeRemainders.updateOne(
      { _id: safeRemainder._id },
      {
        $set: {
          incomeTrId: newIncomeTrId,
          outTrId: newOutTrId,
          saleTrId: newSaleTrId,
          status: SAFE_REMAINDER_STATUSES.PUBLISHED,
        },
      },
    );
    return await models.SafeRemainders.getRemainder(_id);
  },

  safeRemainderUndoTr: async (
    _root: any,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    const { incomeTrId, outTrId, saleTrId } = safeRemainder;
    await safeRemainderUndoTrs(models, incomeTrId);
    await safeRemainderUndoTrs(models, outTrId);
    await safeRemainderUndoTrs(models, saleTrId);
    await models.SafeRemainders.updateOne(
      { _id: safeRemainder._id },
      {
        $unset: { incomeTrId: '', outTrId: '', saleTrId: '' },
        $set: { status: SAFE_REMAINDER_STATUSES.DONE },
      },
    );
    return await models.SafeRemainders.getRemainder(_id);
  },
};

export default safeRemainderMutations;
