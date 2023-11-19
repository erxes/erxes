import { sendCoreMessage } from '../messageBroker';

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const loansTransactionToErkhet = async (
  subdomain,
  generals: any[] = [],
  orderId
) => {
  let erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !erkhetConfig.userEmail ||
    !erkhetConfig.defaultCustomer
  ) {
    return;
  }

  var ptrs: any[] = [];

  generals.forEach(row => {
    let work: any[] = [];
    row.dtl.forEach(dtl => {
      work.push({
        account: dtl.account,
        date: new Date(row.payDate).toISOString().slice(0, 10),
        amount: dtl.amount,
        side: dtl.side,
        customer: row.customerCode,
        bill_number: row.generalNumber,
        description: row.description
      });
    });
    ptrs.push(work);
  });

  const orderInfos = [
    {
      orderId: orderId,
      ptrs: ptrs
    }
  ];

  return {
    userEmail: erkhetConfig.userEmail,
    config: JSON.stringify({ defaultCustomer: erkhetConfig.defaultCustomer }),
    token: erkhetConfig.apiToken,
    apiKey: erkhetConfig.apiKey,
    apiSecret: erkhetConfig.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};
