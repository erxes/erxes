import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from '../messageBroker';

export const getIncomeData = async (
  subdomain,
  config,
  purchase,
  dateType = ''
) => {
  let customerCode = '';

  const companyIds = await sendCoreMessage({
    subdomain,
    action: 'conformities.savedConformity',
    data: {
      mainType: 'purchase',
      mainTypeId: purchase._id,
      relTypes: ['company']
    },
    isRPC: true,
    defaultValue: []
  });

  if (companyIds.length > 0) {
    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1 }
      },
      isRPC: true,
      defaultValue: []
    });

    for (const company of companies) {
      if (company.code) {
        customerCode = company.code;
      }
    }
  }

  if (!customerCode) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'purchase',
        mainTypeId: purchase._id,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length > 0) {
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {
          selector: { _id: { $in: customerIds } },
          fields: { _id: 1, code: 1 },
        },
        isRPC: true,
        defaultValue: []
      });
      customerCode = customers.find(c => c?.code)?.code || '';

    }
  }

  if (!customerCode) {
    customerCode = config.defaultCustomer;
  }

  const productsIds = purchase.productsData.map((item) => item.productId);

  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: { _id: { $in: productsIds } },
      limit: purchase.productsData.length
    },
    isRPC: true,
    defaultValue: []
  });

  const productCodeById = {};
  for (const product of products) {
    productCodeById[product._id] = product.code;
  }

  const details: any = [];

  const branchIds = purchase.productsData.map((pd) => pd.branchId) || [];
  const departmentIds =
    purchase.productsData.map((pd) => pd.departmentId) || [];

  const branchesById = {};
  const departmentsById = {};

  if (branchIds.length) {
    const branches = await sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: { query: { _id: { $in: branchIds } } },
      isRPC: true,
      defaultValue: []
    });

    for (const branch of branches) {
      branchesById[branch._id] = branch;
    }
  }

  if (departmentIds.length) {
    const departments = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: { _id: { $in: departmentIds } },
      isRPC: true,
      defaultValue: []
    });

    for (const department of departments) {
      departmentsById[department._id] = department;
    }
  }

  for (const productData of purchase.productsData) {
    // not tickUsed product not sent
    if (!productData.tickUsed) {
      continue;
    }

    // if wrong productId then not sent
    if (!productCodeById[productData.productId]) {
      continue;
    }

    let otherCode: string = '';
    if (productData.branchId || productData.departmentId) {
      const branch = branchesById[productData.branchId || ''] || {};
      const department = departmentsById[productData.departmentId || ''] || {};
      otherCode = `${branch.code || ''}_${department.code || ''}`;
    }

    details.push({
      count: productData.quantity,
      amount: productData.amount,
      discount: productData.discount,
      inventoryCode: productCodeById[productData.productId],
      otherCode,
      expense: productData.expenseAmount
    });
  }

  // credit payments coll
  const payments = {};

  let sumSaleAmount =
    details.reduce((predet, detail) => {
      return { amount: predet.amount + detail.amount };
    }).amount +
    purchase.expensesData.reduce((preEx, exp) => {
      return { expense: preEx.value + exp.value };
    }).expense;

  for (const paymentKind of Object.keys(purchase.paymentsData || [])) {
    const payment = purchase.paymentsData[paymentKind];
    const accountStr =
      (config.payAccounts || {})[paymentKind] || config.defaultPayAccount;
    payments[accountStr] = (payments[accountStr] || 0) + payment.amount;
    sumSaleAmount = sumSaleAmount - payment.amount;
  }

  for (const expense of purchase.expensesData) {
    const accountStr = config.defaultPayAccount;
    payments[accountStr] = (payments[accountStr] || 0) + expense.value;
    sumSaleAmount = sumSaleAmount - expense.value;
  }

  // if payments is less sum sale amount then create debt
  if (sumSaleAmount > 0.005) {
    payments[config.defaultPayAccount] =
      (payments[config.defaultPayAccount] || 0) + sumSaleAmount;
  } else if (sumSaleAmount < -0.005) {
    if ((payments[config.defaultPayAccount] || 0) > 0.005) {
      payments[config.defaultPayAccount] =
        payments[config.defaultPayAccount] + sumSaleAmount;
    } else {
      for (const key of Object.keys(payments)) {
        if (payments[key] > 0.005) {
          payments[key] = payments[key] + sumSaleAmount;
        }
      }
    }
  }

  let date = new Date().toISOString().slice(0, 10);
  let checkDate = false;

  switch (dateType) {
    case 'lastMove':
      date = new Date(purchase.stageChangedDate).toISOString().slice(0, 10);
      break;
    case 'created':
      date = new Date(purchase.createdAt).toISOString().slice(0, 10);
      break;
    case 'closeOrCreated':
      date = new Date(purchase.closeDate || purchase.createdAt)
        .toISOString()
        .slice(0, 10);
      break;
    case 'closeOrMove':
      date = new Date(purchase.closeDate || purchase.stageChangedDate)
        .toISOString()
        .slice(0, 10);
      break;
    case 'firstOrMove':
      date = new Date(purchase.stageChangedDate).toISOString().slice(0, 10);
      checkDate = true;
      break;
    case 'firstOrCreated':
      date = new Date(purchase.createdAt).toISOString().slice(0, 10);
      checkDate = true;
      break;
  }

  const orderInfos = [
    {
      date,
      checkDate,
      orderId: purchase._id,
      number: purchase.number || '',
      customerCode,
      description: purchase.name,
      hasVat: config.hasVat || false,
      hasCitytax: config.hasCitytax || false,
      vatRow: config.vatRow || '',
      details,
      payments,
      expenses: purchase.expensesData
    },
  ];

  const sendConfig = {
    defaultCustomer: config.defaultCustomer,
    catAccLocMap: (config.catAccLocMap || []).map((item) => ({
      ...item,
      otherCode: `${item.branch || ''}_${item.department || ''}`
    })),
  };

  const postData = {
    userEmail: config.userEmail,
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    config: JSON.stringify(sendConfig),
    orderInfos: JSON.stringify(orderInfos)
  };

  return postData;
};
