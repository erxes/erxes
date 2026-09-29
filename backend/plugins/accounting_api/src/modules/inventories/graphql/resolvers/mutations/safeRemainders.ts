import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
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
import { buildSafeRemainderTransactionDetails } from '~/modules/inventories/utils/safeRemainderTransactions';
import { getLastIncomePrices } from '~/modules/accounting/utils/inventories';

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
    const lastIncomePrices = await getLastIncomePrices(
      models,
      items.map((item) => item.productId),
    );
    const transactionItems = items.map((item) => ({
      ...item,
      trInfo: {
        ...item.trInfo,
        lastIncomePrice: lastIncomePrices[item.productId] ?? 0,
      },
    })) as ISafeRemainderItemDocument[];
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
    const { mainTr: oldCostIncreaseTr } = costIncreaseTrId
      ? await models.Transactions.getOriginTransactions(costIncreaseTrId)
      : {};
    const { mainTr: oldCostDecreaseTr } = costDecreaseTrId
      ? await models.Transactions.getOriginTransactions(costDecreaseTrId)
      : {};

    const {
      incomeDetails,
      outDetails,
      saleDetails,
      costIncreaseDetails,
      costDecreaseDetails,
    } = buildSafeRemainderTransactionDetails(transactionItems, {
      incomeAccountId: incomeRule?.accountId ?? '',
      outAccountId: outRule?.accountId ?? '',
      saleAccountId: saleRule?.accountId ?? '',
      costIncreaseAccountId: costIncreaseRule?.accountId ?? '',
      costDecreaseAccountId: costDecreaseRule?.accountId ?? '',
    });

    if (costIncreaseDetails.length && !costIncreaseRule?.accountId) {
      throw new Error('Cost increase inventory account is required');
    }
    if (costDecreaseDetails.length && !costDecreaseRule?.accountId) {
      throw new Error('Cost decrease inventory account is required');
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
      oldMainTr: oldCostIncreaseTr,
      user,
    });
    const newCostDecreaseTrId = await safeRemainderDoTrs(models, {
      safeRemainder,
      details: costDecreaseDetails,
      journal: JOURNALS.INV_JUSTIFY,
      side: TR_SIDES.CREDIT,
      oldMainTr: oldCostDecreaseTr,
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
