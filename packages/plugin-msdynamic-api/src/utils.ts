import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage,
} from './messageBroker';
import * as moment from 'moment';
import fetch from 'node-fetch';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true,
  });
};

const companyRequest = async (subdomain, config, action, updateCode, doc) => {
  const company = await sendContactsMessage({
    subdomain,
    action: 'companies.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (company || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const document: any = {
      primaryName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      location: doc?.Country_Region_Code === 'MN' ? 'Mongolia' : '',
      businessType: doc?.Partner_Type === 'Person' ? 'Customer' : 'Partner',
      scopeBrandIds: brandIds,
    };

    if (company) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.updateCompany',
        data: { _id: company._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendContactsMessage({
        subdomain,
        action: 'companies.createCompany',
        data: { ...document },
        isRPC: true,
      });
    }
  }
};

const customerRequest = async (subdomain, config, action, updateCode, doc) => {
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (customer || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const document: any = {
      firstName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      scopeBrandIds: brandIds,
      state: 'customer',
    };

    if (customer) {
      await sendContactsMessage({
        subdomain,
        action: 'customers.updateCustomer',
        data: { _id: customer._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: { ...document },
        isRPC: true,
      });
    }
  }
};

export const consumeInventory = async (subdomain, config, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.No.replace(/\s/g, '');

  const product = await sendProductsMessage({
    subdomain,
    action: 'findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (product || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    const productCategory = await sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: { name: doc.Item_Category_Code },
      isRPC: true,
    });

    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const document: any = {
      name: doc?.Description || 'default',
      shortName: doc?.Description_2 || '',
      type: doc.Type === 'Inventory' ? 'product' : 'service',
      unitPrice: doc?.Unit_Price || 0,
      code: doc.No,
      uom: doc?.Base_Unit_of_Measure || 'PCS',
      categoryId: productCategory ? productCategory._id : product.categoryId,
      scopeBrandIds: brandIds,
      status: 'active',
    };

    if (product) {
      await sendProductsMessage({
        subdomain,
        action: 'updateProduct',
        data: { _id: product._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'createProduct',
        data: { doc: { ...document } },
        isRPC: true,
      });
    }
  } else if (action === 'delete' && product) {
    const anotherBrandIds = brandIds.filter((b) => b && b !== config.brandId);
    if (anotherBrandIds.length) {
      await sendProductsMessage({
        subdomain,
        action: 'updateProduct',
        data: {
          _id: product._id,
          doc: { ...product, scopeBrandIds: anotherBrandIds },
        },
        isRPC: true,
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'removeProducts',
        data: { _ids: [product._id] },
        isRPC: true,
      });
    }
  }
};

export const consumePrice = async (subdomain, config, doc, action) => {
  const updateCode = doc.Item_No.replace(/\s/g, '');
  let document: any = {};

  const product = await sendProductsMessage({
    subdomain,
    action: 'findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (product || {}).scopeBrandIds || [];

  if (action === 'update' && doc.Item_No) {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const date = moment(doc.Ending_Date).format('YYYY-MM-DD');

    if (product && product.unitPrice === 0) {
      document = {
        unitPrice: doc?.Unit_Price,
      };
    }

    if (product && product.unitPrice > 0) {
      document = {
        unitPrice:
          product.unitPrice < doc?.Unit_Price
            ? product.unitPrice
            : doc?.Unit_Price,
      };
    }

    if (doc.Ending_Date === '0001-01-01') {
      if (product) {
        await sendProductsMessage({
          subdomain,
          action: 'updateProduct',
          data: { _id: product._id, doc: { ...document } },
          isRPC: true,
        });
      }
    }

    if (doc.Ending_Date !== '0001-01-01' && moment(date).isAfter(currentDate)) {
      if (product) {
        await sendProductsMessage({
          subdomain,
          action: 'updateProduct',
          data: { _id: product._id, doc: { ...document } },
          isRPC: true,
        });
      }
    }
  }
};

export const consumeCategory = async (subdomain, config, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.Code;

  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (productCategory || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.Code) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const document: any = {
      name: doc?.Code || 'default',
      code: doc?.Code,
      description: doc?.Description,
      scopeBrandIds: brandIds,
      status: 'active',
    };

    if (productCategory) {
      await sendProductsMessage({
        subdomain,
        action: 'categories.updateProductCategory',
        data: { _id: productCategory._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'categories.createProductCategory',
        data: { doc: { ...document } },
        isRPC: true,
      });
    }
  } else if (action === 'delete' && productCategory) {
    await sendProductsMessage({
      subdomain,
      action: 'categories.removeProductCategory',
      data: { _id: productCategory._id },
      isRPC: true,
    });
  }
};

export const consumeCustomers = async (subdomain, config, doc, action) => {
  const updateCode = action === 'delete' ? doc.code : doc.No.replace(/\s/g, '');

  if (doc?.Partner_Type === 'Company') {
    companyRequest(subdomain, config, action, updateCode, doc);
  }

  if (doc?.Partner_Type === 'Person') {
    if (doc.VAT_Registration_No.length === 7) {
      companyRequest(subdomain, config, action, updateCode, doc);
    } else {
      customerRequest(subdomain, config, action, updateCode, doc);
    }
  }

  if (doc?.Partner_Type === ' ' && doc.VAT_Registration_No) {
    companyRequest(subdomain, config, action, updateCode, doc);
  }

  if (doc?.Partner_Type === ' ' && !doc.VAT_Registration_No) {
    customerRequest(subdomain, config, action, updateCode, doc);
  }

  if (action === 'delete') {
    const company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {},
    });

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {},
    });

    if (action === 'delete' && company) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.removeCompanies',
        data: { _ids: [company._id] },
        isRPC: true,
      });
    }

    if (action === 'delete' && customer) {
      await sendContactsMessage({
        subdomain,
        action: 'customers.removeCustomers',
        data: { customerIds: [customer._id] },
      });
    }
  }
};

export const customerToDynamic = async (subdomain, syncLog, params, models) => {
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

  const sendData: any = {
    Name: name,
    Name_MN: name,
    Phone_No: customer.primaryPhone || '',
    E_Mail: customer.primaryEmail || '',
    Mobile_Phone_No: customer.primaryPhone || '',
    Address: customer.primaryAddress || '',
    Country_Region_Code: 'MN',
    City: 'Orkhon',
    Post_Code: '61000',
    Contact: '',
    VAT_Registration_No: '2737329',
    Gen_Bus_Posting_Group: 'DOMESTIC',
    VAT_Bus_Posting_Group: 'DOMESTIC',
    Customer_Posting_Group: 'TRADE',
    Invoice_Disc_Code: 'BEV-00001',
    Customer_Price_Group: 'ON TRADE',
    Customer_Disc_Group: '',
    Allow_Line_Disc: true,
    Prices_Including_VAT: true,
    Partner_Type: 'Company',
    Payment_Terms_Code: 'ENDOFMONTH',
    Payment_Method_Code: 'BANK',
    Location_Code: 'BEV-10',
    Creation_Date: moment(new Date()).format('YYYY-MM-DD'),
  };

  // EBarimt baihgui baina

  try {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    // const config = configs[brandId || 'noBrand'];
    const config = configs['ZCvn7uB96xPGpxCEtmrul'];

    let responseData;

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, username, password } = config;

    const response = await fetch(
      `${customerApi}?` +
        new URLSearchParams({
          filter: `Phone_No eq '${customer.primaryPhone}`,
        }),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
        body: JSON.stringify(sendData),
      },
    ).then((r) => r.json());

    if (response.value.length === 0) {
      responseData = await fetch(customerApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
        body: JSON.stringify(sendData),
      }).then((r) => r.json());
    }

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          sendData,
          sendStr: JSON.stringify(sendData),
          responseData,
          responseStr: JSON.stringify(responseData),
        },
      },
    );
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
    console.log(e, 'error');
  }
};
