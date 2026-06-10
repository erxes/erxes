import { JOURNALS } from '~/modules/accounting/@types/constants';
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

type AccountingCheckContentType = 'sales:deal' | 'sales:order';

type AccountingSyncResult = {
  skipped: string[];
  error: string[];
  success: string[];
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error) || String(error);
  } catch {
    return String(error);
  }
};

export const getAccountingContentType = (
  contentType?: string,
): AccountingCheckContentType => {
  if (contentType === 'sales:order' || contentType === 'sales:pos.orders') {
    return 'sales:order';
  }

  return 'sales:deal';
};

export const createResult = (): AccountingSyncResult => ({
  skipped: [],
  error: [],
  success: [],
});

export const setDealAccountingResponse = async ({
  subdomain,
  dealId,
  responseFieldId,
  message,
  userId,
}: {
  subdomain: string;
  dealId: string;
  responseFieldId?: string;
  message: string;
  userId?: string;
}) => {
  if (!responseFieldId) {
    return;
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'mutation',
    module: 'deal',
    action: 'updateOne',
    input: {
      selector: { _id: dealId },
      modifier: {
        $set: {
          [`propertiesData.${responseFieldId}`]: message,
        },
      },
    },
    context: { userId },
  });
};

export const setOrderAccountingResponse = async ({
  subdomain,
  orderId,
  message,
}: {
  subdomain: string;
  orderId: string;
  message: string;
}) => {
  await sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'sales',
    module: 'orders',
    action: 'updateOne',
    input: {
      selector: { _id: orderId },
      modifier: { accountingResponse: message },
    },
  });
};

const getTransactionsByContentIds = async ({
  models,
  contentType,
  ids,
}: {
  models: IModels;
  contentType: AccountingCheckContentType;
  ids: string[];
}) => {
  return models.Transactions.find({
    contentType,
    contentId: { $in: ids },
    journal: JOURNALS.INV_SALE,
  }).lean();
};

export const checkSynced = async ({
  models,
  ids,
  contentType,
}: {
  models: IModels;
  ids: string[];
  contentType: AccountingCheckContentType;
}) => {
  const transactions = await getTransactionsByContentIds({
    models,
    contentType,
    ids,
  });

  return ids.map((_id) => {
    const transaction = transactions.find((tr) => tr.contentId === _id);

    return {
      _id,
      isSynced: !!transaction,
      syncedDate: transaction?.date,
      syncedBillNumber: transaction?.number,
      syncedCustomer: transaction?.customerId,
    };
  });
};