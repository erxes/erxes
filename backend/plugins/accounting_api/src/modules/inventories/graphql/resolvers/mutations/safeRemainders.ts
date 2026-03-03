import { moduleCheckPermission } from 'erxes-api-shared/core-modules';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { models } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
import { ITransaction, ITransactionDocument, ITrDetail } from '~/modules/accounting/@types/transaction';
import { SAFE_REMAINDER_STATUSES } from '~/modules/inventories/@types/constants';
import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';
import { ISafeRemainder } from '~/modules/inventories/@types/safeRemainders';

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

  safeRemainderRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    // Delete safe remainder
    return models.SafeRemainders.removeRemainder(_id);
  },

  safeRemainderSubmit: async (
    _root: any,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);

    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('Already submited');
    }

    const { branchId, departmentId, date, productCategoryId } = safeRemainder;

    const afterSafeRems = await models.SafeRemainders.find({
      status: SAFE_REMAINDER_STATUSES.PUBLISHED,
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

    return await models.SafeRemainders.updateOne(
      { _id },
      { $set: { status: SAFE_REMAINDER_STATUSES.PUBLISHED } },
    );
  },

  safeRemainderDoTr: async (
    _root: any,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);
    const items: ISafeRemainderItemDocument[] = await models.SafeRemainderItems.find({ remainderId: _id }).lean();
    const {
      branchId, departmentId, date, productCategoryId,
      incomeRule, incomeTrId, outRule, outTrId, saleRule, saleTrId
    } = safeRemainder;

    const { mainTr: oldIncomeTr, otherTrs: incomeOtherTrs } = incomeTrId ? await models.Transactions.getTrInputDoc(incomeTrId) : {};
    const { mainTr: oldOutTr, otherTrs: outOtherTrs } = outTrId ? await models.Transactions.getTrInputDoc(outTrId) : {};
    const { mainTr: oldSaleTr, otherTrs: saleOtherTrs } = saleTrId ? await models.Transactions.getTrInputDoc(saleTrId) : {};


    const transactionDoc = {
      date: safeRemainder.date,
      branchId,
      departmentId,
      description: 'Census',
      contentType: 'safeRem',
      contentId: safeRemainder._id,

      details: []
    }

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
          amount: fixNum(incomeCount * (item.trInfo.unitCost ?? 0), 6),
          productId,
          count: incomeCount
        });
        continue;
      }

      const outCount = preCount - count;
      if (item.trInfo.isSale) {
        saleDetails.push({
          accountId: saleRule?.accountId ?? '',
          side: TR_SIDES.CREDIT,
          amount: fixNum(outCount * (item.trInfo.salePrice ?? 0), 6),
          productId,
          count: outCount
        });
        continue;
      }

      outDetails.push({
        accountId: saleRule?.accountId ?? '',
        side: TR_SIDES.CREDIT,
        amount: fixNum(outCount * (item.trInfo.unitCost ?? 0), 6),
        productId,
        count: outCount
      });
    }



    // if (oldIncomeTr)
    //   models.Transactions.updatePTransaction()
  }
};

const saveTr = (models: IModels,safeRemainder, details, oldMainTr, otherTrs) => {
  if (!oldMainTr && !details.length) {
    return;
  }

  if (!oldMainTr && details.length) {
    // create
    const transactionDoc = {
      date: safeRemainder.date,
      branchId: safeRemainder.branchId,
      departmentId: safeRemainder.departmentId,
      description: 'Census',
      contentType: 'safeRem',
      contentId: safeRemainder._id,

      details: []
    }
    // models.Transactions.createPTransaction()
  }

  if (oldMainTr && !details.length) {
    // remove
  }

  // update

}
moduleCheckPermission(safeRemainderMutations, 'manageRemainders');

export default safeRemainderMutations;
