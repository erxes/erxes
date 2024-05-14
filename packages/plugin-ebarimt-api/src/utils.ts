import fetch from 'node-fetch';
import {
  sendCoreMessage,
  sendNotificationsMessage,
  sendContactsMessage,
  sendProductsMessage,
} from './messageBroker';

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: 'send', data });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true,
  });
};

export const validCompanyCode = async (config, companyCode) => {
  let result = '';

  const re = new RegExp('(^[А-ЯЁӨҮ]{2}\\d{8}$)|(^\\d{7}$)', 'gui');

  if (re.test(companyCode)) {
    const response = await fetch(
      config.checkCompanyUrl +
      '?' +
      new URLSearchParams({ regno: companyCode }),
    ).then((r) => r.json());

    if (response.found) {
      result = response.name;
    }
  }
  return result;
};

export const companyCheckCode = async (params, subdomain) => {
  if (!params.code) {
    return params;
  }

  const config = await getConfig(subdomain, 'EBARIMT', {});

  if (
    !config ||
    !config.checkCompanyUrl ||
    !config.checkCompanyUrl.includes('http')
  ) {
    return params;
  }

  const companyName = await validCompanyCode(config, params.code);

  if (!companyName) {
    return params;
  }

  if (companyName.includes('**') && params.primaryName) {
    return params;
  }

  params.primaryName = companyName;
  return params;
};

export const validConfigMsg = async (config) => {
  if (!config.url) {
    return 'required url';
  }
  return '';
};

const getCustomerName = (customer) => {
  if (!customer) {
    return '';
  }

  if (customer.firstName && customer.lastName) {
    return `${customer.firstName} - ${customer.lastName}`;
  }

  if (customer.firstName) {
    return customer.firstName;
  }

  if (customer.lastName) {
    return customer.lastName;
  }

  if (customer.primaryEmail) {
    return customer.primaryEmail;
  }

  if (customer.primaryPhone) {
    return customer.primaryPhone;
  }

  return '';
};

export const getPostData = async (subdomain, config, deal) => {
  let type: 'B2C_RECEIPT' | 'B2B_RECEIPT' = 'B2C_RECEIPT';
  let customerCode = '';
  let customerName = '';

  const companyIds = await sendCoreMessage({
    subdomain,
    action: 'conformities.savedConformity',
    data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['company'] },
    isRPC: true,
    defaultValue: [],
  });

  if (companyIds.length > 0) {
    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1, primaryName: 1 },
      },
      isRPC: true,
      defaultValue: [],
    });

    const re = new RegExp('(^[А-ЯЁӨҮ]{2}\\d{8}$)|(^\\d{7}$)', 'gui');
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await fetch(
          config.checkCompanyUrl +
          '?' +
          new URLSearchParams({ regno: company.code }),
        ).then((r) => r.json());

        if (checkCompanyRes.found) {
          type = 'B2B_RECEIPT';
          customerCode = company.code;
          customerName = company.primaryName;
          continue;
        }
      }
    }
  }

  if (type === 'B2C_RECEIPT') {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['customer'] },
      isRPC: true,
      defaultValue: [],
    });

    if (customerIds.length > 0) {
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {
          selector: { _id: { $in: customerIds } },
          fields: {
            _id: 1,
            code: 1,
            firstName: 1,
            lastName: 1,
            primaryEmail: 1,
            primaryPhone: 1,
          },
        },
        isRPC: true,
        defaultValue: [],
      });

      let customer = customers.find((c) => c.code && c.code.match(/^\d{8}$/g));

      if (customer) {
        customerCode = customer.code || '';
        customerName = getCustomerName(customer);
      } else {
        if (customers.length) {
          customer = customers[0];
          customerName = getCustomerName(customer);
        }
      }
    }
  }

  const productsIds = deal.productsData.map((item) => item.productId);
  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productsIds } }, limit: productsIds.length },
    isRPC: true,
    defaultValue: [],
  });

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  return {
    contentType: 'deal',
    contentId: deal._id,
    number: deal.number,

    date: new Date(),
    type,

    customerRD: customerCode,
    customerName,
    // consumerNo?: string;

    details: deal.productsData.filter(prData => prData.tickUsed).map(prData => {
      const product = productsById[prData.productId];
      if (!product) {
        return;
      }
      return {
        product,
        quantity: prData.quantity,
        unitPrice: prData.unitPrice,
        totalDiscount: prData.discount,
        totalAmount: prData.amount
      }
    }),
    nonCashAmounts: Object.keys(deal.paymentsData || {}).map(pay => ({ amount: deal.paymentsData[pay].amount }))
  }
};

export const getCompanyInfo = async ({ getTinUrl, getInfoUrl, tin, rd }: { getTinUrl: string, getInfoUrl: string, tin?: string, rd?: string }) => {
  const tinre = new RegExp('(^\\d{11}$)|(^\\d{14}$)', 'gui');
  if (tin && tinre.test(tin)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${getInfoUrl}?tin=${tin}`
    ).then((r) => r.json());

    return { status: 'checked', result, tin };
  }

  const re = new RegExp('(^[А-ЯЁӨҮ]{2}\\d{8}$)|(^\\d{7}$)', 'gui');

  if (!rd || !re.test(rd)) {
    return { status: 'notValid' };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${getTinUrl}?regNo=${rd}`
  ).then((r) => r.json());

  if (info.status !== 200) {
    return { status: 'notValid' };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${getInfoUrl}?tin=${tinNo}`
  ).then((r) => r.json());

  return { status: 'checked', result, tin: tinNo };
};
