import { IUserDocument } from "erxes-api-shared/core-types"
import { sendTRPCMessage } from "erxes-api-shared/utils"
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

  }
}) => {
  const [contentType, contentId] = ['sales:deal', deal._id];

  const oldTrs = await models.Transactions.find({ contentType, contentId });
  const activeProductsData = deal.productsData?.filter(pd => pd.tickUsed);

  if (!activeProductsData.length) {
    return;
  }

  const trCommonDoc: ITransaction = {
    date: new Date, journal: JOURNALS.INV_SALE, contentType, contentId, details: []
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
    trCommonDoc.customerType = 'company';
    trCommonDoc.customerId = companyIds[0];
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

    trCommonDoc.customerType = 'customer';
    trCommonDoc.customerId = customerIds[0];
  }

  const saleDetails: ITrDetail[] = []
  for (const productData of activeProductsData) {
    saleDetails.push({
      _id: nanoid(),
      accountId: config.saleAccountId,

      // followInfos?: any;
      // originId?: string;
      // originType?: string;
      // originSubId?: string;

      side: TR_SIDES.CREDIT,
      amount: productData.amount,
      currency: productData.currency,
      // currencyAmount?: number;
      // customRate?: number;

      // assignedUserId?: string;

      // excludeVat?: boolean;
      // excludeCtax?: boolean;

      productId: productData.productId,
      count: productData.quantity,
      unitPrice: productData.unitPrice

    })
  }






  await models.Transactions.createPTransaction([], user)
}
