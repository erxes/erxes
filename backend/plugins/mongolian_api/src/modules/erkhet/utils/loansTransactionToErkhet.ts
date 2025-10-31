import { sendTRPCMessage } from "erxes-api-shared/src/utils"; 

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getConfig = async (subdomain, code, defaultValue) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
    defaultValue,
  });
};

export const loansTransactionToErkhet = async (
  subdomain,
  generals: any[] = [],
  orderId
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
