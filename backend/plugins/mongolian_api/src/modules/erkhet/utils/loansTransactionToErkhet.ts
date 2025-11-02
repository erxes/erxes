import { getConfig } from './utils';

export const loansTransactionToErkhet = async (
  subdomain,
  generals: any[] = [],
  orderId,
) => {
  const erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !erkhetConfig.userEmail ||
    !erkhetConfig.defaultCustomer
  ) {
    return;
  }

  const ptrs: any[] = [];

  generals.forEach((row) => {
    let work: any[] = [];

    row.dtl.forEach((dtl: any) => {
      work.push({
        account: dtl.account,
        date: new Date(row.payDate).toISOString().slice(0, 10),
        amount: dtl.amount,
        side: dtl.side,
        customer: row.customerCode,
        bill_number: row.generalNumber,
        description: row.description,
      });
    });
    ptrs.push(work);
  });

  const orderInfos = [
    {
      orderId,
      ptrs,
    },
  ];

  return {
    userEmail: erkhetConfig.userEmail,
    config: JSON.stringify({ defaultCustomer: erkhetConfig.defaultCustomer }),
    token: erkhetConfig.apiToken,
    apiKey: erkhetConfig.apiKey,
    apiSecret: erkhetConfig.apiSecret,
    orderInfos: JSON.stringify(orderInfos),
  };
};
