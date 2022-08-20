import { sendRequest } from 'erxes-api-utils';

export interface IConformity {
  mainType: string;
  mainTypeId: string;
  relType: string;
  relTypeId: string;
}

export const checkCompanyRd = async (models, contract, config) => {
  const conformities = await models.Conformities.getConformities({
    mainType: 'contract',
    mainTypeIds: [contract._id],
    relTypes: ['customer', 'company']
  });
  if (!conformities || !conformities.length) {
    throw new Error('Choose the Customer or Company');
  }

  let billType = 1;
  let customerCode = '';

  const companyIds = conformities.map(item => {
    if (item.mainType === 'company') return item.mainTypeId;
    if (item.relType === 'company') return item.relTypeId;
  });

  if (companyIds.length > 0) {
    const companies =
      (await models.Companies.find({ _id: { $in: companyIds } })) || [];
    const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await sendRequest({
          url: config.checkCompanyUrl,
          method: 'GET',
          params: { regno: company.code }
        });

        if (checkCompanyRes.found) {
          billType = 3;
          customerCode = company.code;
          continue;
        }
      }
    }
  }

  if (billType === 1) {
    const customerIds = conformities.map(item => {
      if (item.mainType === 'customer') return item.mainTypeId;
      if (item.relType === 'customer') return item.relTypeId;
    });

    if (customerIds.length > 0) {
      const customers = await models.Customers.find({
        _id: { $in: customerIds }
      });
      customerCode = customers.length > 0 ? customers[0].code : '' || '';
    }
  }
  return { billType, customerCode };
};

export const getEbarimtData = (config, userEmail, orderInfos) => {
  return {
    userEmail,
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};

export const getJournalsData = (config, userEmail, postConfig, orderInfos) => {
  return {
    userEmail,
    config: JSON.stringify(postConfig),
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};

export const sentErkhet = async (
  messageBroker,
  postData,
  isJournal?,
  isEbarimt?
) => {
  return messageBroker().sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
    action: isJournal
      ? 'get-response-send-journal-orders'
      : 'get-response-send-order-info',
    isEbarimt: isEbarimt || false,
    isJson: true,
    payload: JSON.stringify(postData)
  });
};
