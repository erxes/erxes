import { IUserDocument } from "erxes-api-shared/core-types"
import { fixNum, sendTRPCMessage } from "erxes-api-shared/utils"
import { nanoid } from "nanoid"
import { IModels } from "~/connectionResolvers"
import { ACCOUNT_JOURNALS, JOURNALS, TR_SIDES } from "~/modules/accounting/@types/constants"
import { ITransaction } from "~/modules/accounting/@types/transaction"

const getJournal = async (models, payConfig, amount) => {
  const { accountId } = payConfig;
  const account = await models.Accounts.getAccount({ _id: accountId });

  let journal: string = ''
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

  let side = TR_SIDES.DEBIT
  let lastAmount = amount;

  if (amount < 0) {
    lastAmount = -1 * amount;
    side = TR_SIDES.CREDIT;
  }

  return {
    journal,
    accountId,
    side,
    lastAmount
  }
}

export const dealToTrs = async ({
  subdomain, models, user, deal, config
}: {
  subdomain: string,
  models: IModels,
  user: IUserDocument,
  deal: any,
  config: {
    dateRule: 'alwaysNow' | 'syncedDateOrNow',
    saleAccountId: string,
    saleOutAccountId: string,
    saleCostAccountId: string,
    branchId: string,
    departmentId: string,
    hasVat: boolean,
    hasCtax: boolean,
    vatRowId: string,
    ctaxRowId: string,
    payments: Record<string, { accountId: string }>,
    defaultPayment: { accountId: string },
    defaultNegPayment: { accountId: string },
  }
}) => {
  const activeProductsData = deal.productsData?.filter(pd => pd.tickUsed);
  if (!activeProductsData.length) {
    return;
  }

  let date = new Date;
  let mainId = nanoid();
  let ptrId = nanoid();
  let parentId = mainId;
  let oldOtherTrs = [];

  const [contentType, contentId] = ['sales:deal', deal._id];

  const oldTrs = await models.Transactions.find({ contentType, contentId }).lean();
  if (oldTrs.length) {
    const parentIds = new Set(oldTrs.map(otr => otr.parentId));
    oldOtherTrs = await models.Transactions.find({ parentId: { $in: parentIds }, originId: { $in: [null, ''] }, contentId: { $in: [null, ''] } });
    if (config.dateRule === 'syncedDateOrNow') {
      date = oldTrs[0].date;
    }
    const oldSaleTr = oldTrs.find(otr => otr.journal === JOURNALS.INV_SALE);
    mainId = oldSaleTr?._id || mainId;
    ptrId = oldSaleTr?.ptrId || ptrId;
    parentId = oldSaleTr?.parentId || parentId;
  }

  const saleTrDoc: ITransaction = {
    _id: mainId,
    ptrId,
    parentId,
    date,
    journal: JOURNALS.INV_SALE,
    followInfos: {
      saleOutAccountId: config.saleOutAccountId,
      saleCostAccountId: config.saleCostAccountId,
    },
    branchId: deal.branchId || config.branchId,
    departmentId: deal.departmentId || config.departmentId,
    assignedUserIds: deal.assignedUserIds,

    hasVat: config.hasVat,
    hasCtax: config.hasCtax,
    vatRowId: config.vatRowId,
    ctaxRowId: config.ctaxRowId,

    contentType,
    contentId,
    details: []
  };

  const companyIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType,
      contentId,
      relatedContentType: 'core:company'
    },
    defaultValue: []
  });

  if (companyIds?.length) {
    saleTrDoc.customerType = 'company';
    saleTrDoc.customerId = companyIds[0];
  } else {
    const customerIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType,
        contentId,
        relatedContentType: 'core:customer'
      },
      defaultValue: []
    });

    saleTrDoc.customerType = 'customer';
    saleTrDoc.customerId = customerIds[0];
  }

  const vatRow = await models.VatRows.getVatRow(config.vatRowId);
  const ctaxRow = await models.CtaxRows.getCtaxRow(config.ctaxRowId);

  const taxPercent = fixNum((vatRow.percent ?? 0) + (ctaxRow.percent ?? 0));

  let diffAmount = 0;
  for (const productData of activeProductsData) {
    diffAmount = diffAmount + deal.amount;
    const taxAmount = fixNum((deal.amount * taxPercent) / (100 + taxPercent), 8);
    const amount = fixNum(deal.amount - taxAmount, 8);
    saleTrDoc.details.push({
      _id: nanoid(),
      accountId: config.saleAccountId,
      side: TR_SIDES.CREDIT,
      amount,
      currency: productData.currency,

      productId: productData.productId,
      count: productData.quantity,
      unitPrice: productData.unitPrice
    })
  }

  const paymentTrs: ITransaction[] = []
  for (const payKey of Object.keys(deal.paymentsData)) {
    const { amount, currency } = deal.paymentsData[payKey];
    const payConfig = config.payments[payKey];
    if (!payConfig) {
      continue;
    }

    const { side, accountId, lastAmount, journal } = await getJournal(models, payConfig, amount)
    diffAmount = diffAmount - amount;
    paymentTrs.push({
      _id: nanoid(),
      ptrId,
      parentId,
      date,
      journal,
      branchId: deal.branchId || config.branchId,
      departmentId: deal.departmentId || config.departmentId,
      contentType,
      contentId,
      details: [{
        _id: nanoid(),
        accountId,
        side,
        amount: lastAmount,
        currency,
      }]
    })
  }

  if (diffAmount < -0.005 || diffAmount > 0.005) {
    const { side, accountId, lastAmount, journal } = await getJournal(
      models,
      diffAmount > 0 && config.defaultPayment || config.defaultNegPayment,
      diffAmount
    )

    paymentTrs.push({
      _id: nanoid(),
      ptrId,
      parentId,
      date,
      journal,
      branchId: deal.branchId || config.branchId,
      departmentId: deal.departmentId || config.departmentId,
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

  await models.Transactions.createPTransaction([{ ...saleTrDoc }, ...paymentTrs, ...oldOtherTrs], user);
}
