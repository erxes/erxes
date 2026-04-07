import { fixNum } from "erxes-api-shared/utils"
import { nanoid } from "nanoid"
import { IModels } from "~/connectionResolvers"
import { ACCOUNT_JOURNALS, JOURNALS, TR_FOLLOW_TYPES, TR_SIDES } from "~/modules/accounting/@types/constants"
import { ITransaction, ITransactionDocument } from "~/modules/accounting/@types/transaction"

const getJournal = async (models: IModels, payConfig: { accountId: string }, amount: number) => {
  const { accountId } = payConfig;
  const account = await models.Accounts.findOne({ _id: accountId }).lean();

  if (!account) {
    return;
  }

  let journal: string = ACCOUNT_JOURNALS.MAIN;
  switch (account.journal) {
    case ACCOUNT_JOURNALS.CASH:
      journal = JOURNALS.CASH;
      break;
    case ACCOUNT_JOURNALS.BANK:
      journal = JOURNALS.BANK;
      break;
    case ACCOUNT_JOURNALS.DEBT:
      journal = amount > 0 && JOURNALS.RECEIVABLE || JOURNALS.PAYABLE;
      break;
  }

  let side = TR_SIDES.CREDIT
  let lastAmount = amount;

  if (amount < 0) {
    lastAmount = -1 * amount;
    side = TR_SIDES.DEBIT;
  }

  return {
    journal,
    accountId,
    side,
    lastAmount
  }
}

export const dealToReturnTrs = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subdomain, models, userId, deal, config
}: {
  subdomain: string,
  models: IModels,
  userId: string,
  deal: any,
  config: {
    dateRule: 'alwaysNow' | 'syncedDateOrNow',
    defaultPayment: { accountId: string },
    returnType: 'delete' | 'fullTr' | 'onlySale'
  }
}) => {
  let date = new Date;
  let mainId = nanoid();
  let ptrId = nanoid();
  let parentId = mainId;
  let oldOtherTrs: ITransactionDocument[] = [];

  const [contentType, contentId] = ['sales:deal', deal._id];

  const oldTrs = await models.Transactions.find({ contentType, contentId, journal: JOURNALS.INV_SALE_RETURN }).lean();
  if (oldTrs.length) {
    const parentIds = [...new Set(oldTrs.map(otr => otr.parentId))];
    oldOtherTrs = await models.Transactions.find({ parentId: { $in: parentIds }, originId: { $in: [null, ''] }, contentId: { $in: [null, ''] } }).lean();
    if (config.dateRule === 'syncedDateOrNow') {
      date = oldTrs[0].date;
    }

    const oldReturnTr = oldTrs[0];
    mainId = oldReturnTr?._id || mainId;
    ptrId = oldReturnTr?.ptrId || ptrId;
    parentId = oldReturnTr?.parentId || parentId;
  }

  const firstSaleTr = await models.Transactions.findOne({ contentType, contentId, journal: JOURNALS.INV_SALE }).lean();

  if (!firstSaleTr) {
    console.log('No sales receipt was found, so no return receipt is required.');
    return;
  }

  if (config.returnType === 'delete') {
    // davtah shaardlagagui, gehdeee yamar negen bugaar hogorson borluulalt uldeehgui geseneer davtav
    const allFirstSaleTrs = await models.Transactions.find({ contentType, contentId, journal: JOURNALS.INV_SALE }).lean();
    for (const tr of allFirstSaleTrs) {
      await models.Transactions.removePTransaction({ parentId: tr.parentId });
    }
    return;
  }

  const returnTrDoc: ITransaction = {
    _id: mainId,
    ptrId,
    parentId,
    date,
    journal: JOURNALS.INV_SALE_RETURN,
    followInfos: {
      ...firstSaleTr.followInfos,
      saleTransactionId: firstSaleTr._id,
    },
    branchId: firstSaleTr.branchId,
    departmentId: firstSaleTr.departmentId,
    assignedUserIds: deal.assignedUserIds,
    customerType: firstSaleTr.customerType,
    customerId: firstSaleTr.customerId,

    preTrId: firstSaleTr?._id,
    contentType,
    contentId,

    hasVat: firstSaleTr.hasVat,
    vatRowId: firstSaleTr.vatRowId,
    hasCtax: firstSaleTr.hasCtax,
    ctaxRowId: firstSaleTr.ctaxRowId,

    details: []
  };

  let totalAmount = 0;
  for (const detail of firstSaleTr.details) {
    totalAmount += detail.amount;
    returnTrDoc.details.push({
      ...detail,
      side: TR_SIDES.DEBIT,
    });
  }
  
  const followTaxTrs = await models.Transactions.find({originId: firstSaleTr._id, originType: {$in: [TR_FOLLOW_TYPES.VAT, TR_FOLLOW_TYPES.CTAX]}});
  for(const taxTr of followTaxTrs) {
    totalAmount += taxTr.details?.[0]?.amount ?? 0;
  }

  const paymentTrs: ITransaction[] = [];

  if (config.defaultPayment) {
    const payResp = await getJournal(
      models,
      config.defaultPayment,
      totalAmount
    );

    if (payResp) {
      const { side, accountId, lastAmount, journal } = payResp;

      paymentTrs.push({
        _id: nanoid(),
        ptrId,
        parentId,
        date,
        journal,
        branchId: firstSaleTr.branchId,
        departmentId: firstSaleTr.departmentId,
        customerType: firstSaleTr.customerType,
        customerId: firstSaleTr.customerId,
        contentType,
        contentId,
        details: [{
          _id: nanoid(),
          accountId,
          side,
          amount: lastAmount,
        }]
      })
    }
  }

  if (oldTrs.length) {
    await models.Transactions.updatePTransaction(parentId, [{ ...returnTrDoc }, ...paymentTrs, ...oldOtherTrs], userId);
  } else {
    await models.Transactions.createPTransaction([{ ...returnTrDoc }, ...paymentTrs, ...oldOtherTrs], userId);
  }
}
