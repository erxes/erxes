import { sendRequest } from '@erxes/api-utils/src';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

const companyRequest = async (subdomain, action, updateCode, doc) => {
  const company = await sendContactsMessage({
    subdomain,
    action: 'companies.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {}
  });

  if ((action === 'update' && doc.No) || action === 'create') {
    const document: any = {
      primaryName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      location: doc?.Country_Region_Code === 'MN' ? 'Mongolia' : '',
      businessType: doc?.Partner_Type === 'Person' ? 'Customer' : 'Partner'
    };

    if (company) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.updateCompany',
        data: { _id: company._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendContactsMessage({
        subdomain,
        action: 'companies.createCompany',
        data: { ...document },
        isRPC: true
      });
    }
  }
};

const customerRequest = async (subdomain, action, updateCode, doc) => {
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {}
  });

  if ((action === 'update' && doc.No) || action === 'create') {
    const document: any = {
      firstName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      state: 'customer'
    };

    if (customer) {
      await sendContactsMessage({
        subdomain,
        action: 'customers.updateCustomer',
        data: { _id: customer._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: { ...document },
        isRPC: true
      });
    }
  }
};

export const consumeInventory = async (subdomain, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.No.replace(/\s/g, '');

  const product = await sendProductsMessage({
    subdomain,
    action: 'findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {}
  });

  if ((action === 'update' && doc.No) || action === 'create') {
    const productCategory = await sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: { name: doc.Item_Category_Code },
      isRPC: true
    });

    const document: any = {
      name: doc?.Description || 'default',
      shortName: doc?.Description_2 || '',
      type: doc.Type === 'Inventory' ? 'product' : 'service',
      unitPrice: doc?.Unit_Price || 0,
      code: doc.No,
      uom: doc?.Base_Unit_of_Measure || 'PCS',
      categoryId: productCategory ? productCategory._id : product.categoryId,
      status: 'active'
    };

    if (product) {
      await sendProductsMessage({
        subdomain,
        action: 'updateProduct',
        data: { _id: product._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'createProduct',
        data: { doc: { ...document } },
        isRPC: true
      });
    }
  } else if (action === 'delete' && product) {
    await sendProductsMessage({
      subdomain,
      action: 'removeProducts',
      data: { _ids: [product._id] },
      isRPC: true
    });
  }
};

export const consumeCategory = async (subdomain, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.Code;

  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {}
  });

  if ((action === 'update' && doc.Code) || action === 'create') {
    const document: any = {
      name: doc?.Code || 'default',
      code: doc?.Code,
      description: doc?.Description,
      status: 'active'
    };

    if (productCategory) {
      await sendProductsMessage({
        subdomain,
        action: 'categories.updateProductCategory',
        data: { _id: productCategory._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'categories.createProductCategory',
        data: { doc: { ...document } },
        isRPC: true
      });
    }
  } else if (action === 'delete' && productCategory) {
    await sendProductsMessage({
      subdomain,
      action: 'categories.removeProductCategory',
      data: { _id: productCategory._id },
      isRPC: true
    });
  }
};

export const consumeCustomers = async (subdomain, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.No.replace(/\s/g, '');

  if (doc?.Partner_Type === 'Company') {
    companyRequest(subdomain, action, updateCode, doc);
  }

  if (doc?.Partner_Type === 'Person') {
    if (doc.VAT_Registration_No.length === 7) {
      companyRequest(subdomain, action, updateCode, doc);
    } else {
      customerRequest(subdomain, action, updateCode, doc);
    }
  }

  if (doc?.Partner_Type === ' ' && doc.VAT_Registration_No) {
    companyRequest(subdomain, action, updateCode, doc);
  }

  if (doc?.Partner_Type === ' ' && !doc.VAT_Registration_No) {
    customerRequest(subdomain, action, updateCode, doc);
  }

  if (action === 'delete') {
    const company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {}
    });

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {}
    });

    if (action === 'delete' && company) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.removeCompanies',
        data: { _ids: [company._id] },
        isRPC: true
      });
    }

    if (action === 'delete' && customer) {
      await sendContactsMessage({
        subdomain,
        action: 'customers.removeCustomers',
        data: { customerIds: [customer._id] }
      });
    }
  }
};

export const customerToDynamic = async (subdomain, params) => {
  const customer = params;

  let name = customer.primaryName || '';

  name =
    name && customer.firstName
      ? name.concat(' ').concat(customer.firstName || '')
      : name || customer.firstName || '';

  name =
    name && customer.lastName
      ? name.concat(' ').concat(customer.lastName || '')
      : name || customer.lastName || '';

  name = name ? name : '';

  const sendData = {
    Name: name,
    E_Mail: customer.primaryEmail || '',
    Phone_No: customer.primaryPhone || '',
    Search_Name: name
  };

  try {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, username, password } = config;

    const response = await sendRequest({
      url: `${customerApi}?$filter=Phone_No eq '${customer.primaryPhone}'`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64'
        )}`
      },
      body: sendData
    });

    if (response.value.length === 0) {
      await sendRequest({
        url: customerApi,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        },
        body: sendData
      });
    }
  } catch (e) {
    console.log(e, 'error');
  }
};
