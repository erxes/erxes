import { IUserDocument } from "erxes-api-shared/core-types"
import { fixNum, sendTRPCMessage } from "erxes-api-shared/utils"
import { nanoid } from "nanoid"
import { IModels } from "~/connectionResolvers"
import { JOURNALS, TR_SIDES } from "~/modules/accounting/@types/constants"
import { ITransaction, ITrDetail } from "~/modules/accounting/@types/transaction"

export const dealToTrs = async ({
  subdomain, models, user, deal, config
}: {
  subdomain: string, models: IModels, user: IUserDocument, deal: any, config: {
    date: 'alwaysNow' | 'syncedDateOrNow',
    saleAccountId: string,
    saleOutAccountId: string,
    saleCostAccountId: string,
    branchId: string,
    departmentId: string,
    hasVat: boolean,
    hasCtax: boolean,
    vatRowId: string,
    ctaxRowId: string,

  }
}) => {
  const [contentType, contentId] = ['sales:deal', deal._id];

  const oldTrs = await models.Transactions.find({ contentType, contentId });
  const activeProductsData = deal.productsData?.filter(pd => pd.tickUsed);

  if (!activeProductsData.length) {
    return;
  }

  const mainId = nanoid();
  const ptrId = nanoid();
  const saleTrDoc: ITransaction = {
    _id: mainId,
    ptrId: ptrId,
    parentId: mainId,
    date: new Date,
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

  const saleDetails: ITrDetail[] = []
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

  deal.paymentsData







  await models.Transactions.createPTransaction([], user)
}
