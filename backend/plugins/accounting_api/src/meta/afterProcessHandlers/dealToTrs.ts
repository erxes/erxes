import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import {
  calcAccountingProductsTaxRule,
  calcDealPreTaxPercent,
  ensureCtaxRowByProductRule,
  getDealPaymentTypes,
  getProductsByIds,
  subtractPreTaxAmount,
} from './taxRules';
import { getDealAccountingDate } from './dealDate';
import { getJournal } from './utils';

export const dealToTrs = async ({
  subdomain,
  models,
  userId,
  deal,
  config,
  dateType,
}: {
  subdomain: string;
  models: IModels;
  userId: string;
  deal: any;
  dateType?: string;
  config: {
    dateRule: 'alwaysNow' | 'syncedDateOrNow';
    responseFieldId?: string;
    saleAccountId: string;
    saleOutAccountId: string;
    saleCostAccountId: string;
    branchId: string;
    departmentId: string;
    hasVat: boolean;
    hasCtax: boolean;
    vatRowId: string;
    ctaxRowId: string;
    payments: Record<string, { accountId: string }>;
    defaultPayment: { accountId: string };
    defaultNegPayment: { accountId: string };
    reverseVatRules?: string[];
    reverseCtaxRules?: string[];
    trStatus?: string;
  };
}) => {
  const activeProductsData = deal.productsData?.filter(
    (pd) => pd.tickUsed && pd.quantity,
  );
  if (!activeProductsData?.length) {
    return;
  }

  let mainId = nanoid();
  let ptrId = nanoid();
  let parentId = mainId;

  const [contentType, contentId] = ['sales:deal', deal._id];
  const number = deal.number;

  const oldTrs = await models.Transactions.find({
    contentType,
    contentId,
    journal: JOURNALS.INV_SALE,
  }).lean();
  if (oldTrs?.length) {
    const oldSaleTr = oldTrs[0];
    mainId = oldSaleTr?._id || mainId;
    ptrId = oldSaleTr?.ptrId || ptrId;
    parentId = oldSaleTr?.parentId || parentId;
  }
  const date = getDealAccountingDate({
    deal,
    dateRule: config.dateRule,
    dateType,
    existingDate: oldTrs[0]?.date,
  });

  const saleTrDoc: ITransaction = {
    _id: mainId,
    ptrId,
    parentId,
    number,
    date,
    description: deal.name,
    journal: JOURNALS.INV_SALE,
    side: TR_SIDES.CREDIT,
    status: config.trStatus || TR_STATUSES.COMPLETE,
    followInfos: {
      saleOutAccountId: config.saleOutAccountId,
      saleCostAccountId: config.saleCostAccountId,
    },
    branchId: deal.branchId || config.branchId,
    departmentId: deal.departmentId || config.departmentId,
    assignedUserIds: deal.assignedUserIds,

    contentType,
    contentId,
    details: [],
  };

  const companyIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType,
      contentId,
      relatedContentType: 'core:company',
    },
    defaultValue: [],
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
        relatedContentType: 'core:customer',
      },
      defaultValue: [],
    });

    saleTrDoc.customerType = 'customer';
    saleTrDoc.customerId = customerIds[0];
  }

  const paymentTypes = await getDealPaymentTypes(subdomain, deal);
  const { itemAmountPrePercent, preTaxPaymentTypes } = calcDealPreTaxPercent(
    paymentTypes,
    deal,
  );

  const products = await getProductsByIds(
    subdomain,
    activeProductsData.map((item) => item.productId),
  );
  const { productIdsByVatRule, productIdsByCtaxRule, ctaxRuleByProductId } =
    await calcAccountingProductsTaxRule(subdomain, config, products);

  const hasVat = config.hasVat && config.vatRowId;
  const firstCtaxRule = Object.values(ctaxRuleByProductId)[0];
  const reverseCtaxRow = config.hasCtax
    ? undefined
    : await ensureCtaxRowByProductRule(models, firstCtaxRule);

  const ctaxRowId = config.hasCtax ? config.ctaxRowId : reverseCtaxRow?._id;
  const hasCtax = !!ctaxRowId && (config.hasCtax || productIdsByCtaxRule.size);

  let vatPercent = 0;
  let ctaxPercent = 0;
  if (config.hasVat && config.vatRowId) {
    const vatRow = await models.VatRows.getVatRow({ _id: config.vatRowId });
    vatPercent = fixNum(vatRow?.percent ?? 0);
    saleTrDoc.hasVat = true;
    saleTrDoc.vatRowId = config.vatRowId;
  }

  if (hasCtax) {
    const ctaxRow = await models.CtaxRows.getCtaxRow({ _id: ctaxRowId });
    ctaxPercent = fixNum(ctaxRow?.percent ?? 0);
    saleTrDoc.hasCtax = true;
    saleTrDoc.ctaxRowId = ctaxRowId;
  }

  let diffAmount = 0;
  for (const productData of activeProductsData) {
    const firstAmount = subtractPreTaxAmount(
      productData.amount,
      itemAmountPrePercent,
    );
    diffAmount = diffAmount + firstAmount;
    const excludeVat =
      !!hasVat && productIdsByVatRule.has(productData.productId);
    const includeCtax =
      !!hasCtax &&
      (config.hasCtax || productIdsByCtaxRule.has(productData.productId));
    const excludeCtax = !!hasCtax && !includeCtax;
    const productTaxPercent =
      (hasVat && !excludeVat ? vatPercent : 0) +
      (hasCtax && !excludeCtax ? ctaxPercent : 0);
    const taxAmount = fixNum(
      (firstAmount * productTaxPercent) / (100 + productTaxPercent),
      8,
    );

    const amount = fixNum(firstAmount - taxAmount, 8);

    saleTrDoc.details.push({
      _id: nanoid(),
      accountId: config.saleAccountId,
      amount,
      currency: productData.currency,

      productId: productData.productId,
      count: productData.quantity,
      unitPrice: fixNum(amount / productData.quantity, 4),
      excludeVat,
      excludeCtax,
    });
  }

  const paymentTrs: ITransaction[] = [];
  const paidAmounts = Object.entries(deal.paymentsData || {}).map(
    ([type, payment]: [string, any]) => ({
      type,
      amount: Number(payment?.amount || 0),
      currency: payment?.currency,
    }),
  );

  if (deal.mobileAmount) {
    paidAmounts.push({
      type: 'mobile',
      amount: Number(deal.mobileAmount || 0),
      currency: 'MNT',
    });
  }

  for (const paidAmount of paidAmounts) {
    const { type, amount, currency } = paidAmount;
    if (preTaxPaymentTypes.includes(type)) {
      continue;
    }

    if (amount < 0.005 && amount > -0.005) {
      continue;
    }

    const payConfig = config.payments[type];
    if (!payConfig) {
      continue;
    }

    const payResp = await getJournal(models, payConfig, amount);
    if (!payResp) {
      continue;
    }

    const { side, accountId, lastAmount, journal } = payResp;
    diffAmount = diffAmount - amount;
    paymentTrs.push({
      _id: nanoid(),
      ptrId,
      parentId,
      number,
      date,
      description: `${deal.name} (${type})`,
      journal,
      side,
      branchId: deal.branchId || config.branchId,
      departmentId: deal.departmentId || config.departmentId,
      customerType: saleTrDoc.customerType,
      customerId: saleTrDoc.customerId,
      contentType,
      contentId,
      details: [
        {
          _id: nanoid(),
          accountId,
          amount: lastAmount,
          currency,
        },
      ],
    });
  }

  if (diffAmount < -0.005 || diffAmount > 0.005) {
    const payResp = await getJournal(
      models,
      (diffAmount > 0 && config.defaultPayment) || config.defaultNegPayment,
      diffAmount,
    );

    if (payResp) {
      const { side, accountId, lastAmount, journal } = payResp;

      paymentTrs.push({
        _id: nanoid(),
        ptrId,
        parentId,
        number,
        date,
        description: `${deal.name} (change)`,
        journal,
        side,
        branchId: saleTrDoc.branchId,
        departmentId: saleTrDoc.departmentId,
        customerType: saleTrDoc.customerType,
        customerId: saleTrDoc.customerId,
        contentType,
        contentId,
        details: [
          {
            _id: nanoid(),
            accountId,
            amount: lastAmount,
          },
        ],
      });
    }
  }

  if (oldTrs.length) {
    // borluulalt zasagdah uyed butsaalt burtgegdsen bol tseverleh
    const returnTrs = await models.Transactions.find({
      contentType,
      contentId,
      preTrId: saleTrDoc._id,
      journal: JOURNALS.INV_SALE_RETURN,
    }).lean();
    if (returnTrs?.length) {
      for (const returnTr of returnTrs) {
        await models.Transactions.removePTransaction({
          parentId: returnTr.parentId,
        });
      }
    }

    await models.Transactions.updatePTransaction(
      parentId,
      [{ ...saleTrDoc }, ...paymentTrs],
      userId,
      { skipAccountPermission: true },
    );
  } else {
    await models.Transactions.createPTransaction(
      [{ ...saleTrDoc }, ...paymentTrs],
      userId,
      { skipAccountPermission: true },
    );
  }
};
