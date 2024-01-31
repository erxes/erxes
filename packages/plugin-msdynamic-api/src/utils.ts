import {
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage,
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

  let customFieldData = [] as any;
  let updateCustomFieldData;

  const brandIds = (company || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    if (doc.Post_Code) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'post code',
            contentType: 'contacts:company',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.Post_Code,
      });
    }

    if (doc.City) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'city',
            contentType: 'contacts:company',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.City,
      });
    }

    if (doc.VAT_Registration_No) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'VAT',
            contentType: 'contacts:company',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.VAT_Registration_No,
      });
    }

    if (doc.Post_Code || doc.VAT_Registration_No || doc.City) {
      updateCustomFieldData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: customFieldData,
        isRPC: true,
      });
    }

    const document: any = {
      primaryName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      location: doc?.Country_Region_Code === 'MN' ? 'Mongolia' : '',
      businessType: doc?.Partner_Type === 'Person' ? 'Customer' : 'Partner',
      customFieldsData: updateCustomFieldData,
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

  let customFieldData = [] as any;
  let updateCustomFieldData;

  const brandIds = (customer || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    if (doc.Post_Code) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'post code',
            contentType: 'contacts:customer',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.Post_Code,
      });
    }

    if (doc.City) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'city',
            contentType: 'contacts:customer',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.City,
      });
    }

    if (doc.VAT_Registration_No) {
      const foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            text: 'VAT',
            contentType: 'contacts:customer',
          },
        },
        isRPC: true,
      });

      customFieldData.push({
        field: foundfield._id,
        value: doc.VAT_Registration_No,
      });
    }

    if (doc.Post_Code || doc.VAT_Registration_No || doc.City) {
      updateCustomFieldData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: customFieldData,
        isRPC: true,
      });
    }

    const document: any = {
      firstName: doc?.Name || 'default',
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      customFieldsData: updateCustomFieldData,
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
  const configs = await getConfig(subdomain, 'DYNAMIC', {});

  const brand = await sendCoreMessage({
    subdomain,
    action: 'brands.findOne',
    data: {
      query: { name: 'Beverage' },
    },
    isRPC: true,
  });

  const config = configs[brand._id || 'noBrand'];

  const customer = params;

  let name = customer.primaryName || '';
  let foundfield;
  let sendVAT;
  let sendCity;
  let sendPostCode;

  name =
    name && customer.firstName
      ? name.concat(' ').concat(customer.firstName || '')
      : name || customer.firstName || '';

  name =
    name && customer.lastName
      ? name.concat(' ').concat(customer.lastName || '')
      : name || customer.lastName || '';

  name = name ? name : '';

  if (customer && customer.customFieldsData.length > 0) {
    for (const field of customer.customFieldsData) {
      foundfield = await sendFormsMessage({
        subdomain,
        action: 'fields.findOne',
        data: {
          query: {
            _id: field.field,
          },
        },
        isRPC: true,
      });

      if (foundfield.text === 'VAT') {
        sendVAT = field.value;
      }

      if (foundfield.text === 'city') {
        sendCity = field.value;
      }

      if (foundfield.text === 'post code') {
        sendPostCode = field.value;
      }
    }
  }

  const getCompanyName = await fetch(
    `https://info.ebarimt.mn/rest/merchant/info?regno=${sendVAT}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ).then((r) => r.json());

  const sendData: any = {
    Name: name,
    Name_MN: getCompanyName && getCompanyName.name ? getCompanyName.name : '',
    Phone_No: customer.primaryPhone || '',
    E_Mail: customer.primaryEmail || '',
    Mobile_Phone_No: customer.primaryPhone || '',
    Address: customer.primaryAddress || '',
    Address_2: '',
    Country_Region_Code: 'MN',
    City: sendCity || 'Ulaanbaatar',
    Post_Code: sendPostCode || '',
    VAT_Registration_No: sendVAT || '',
    Gen_Bus_Posting_Group: config.genBusPostingGroup || 'DOMESTIC',
    VAT_Bus_Posting_Group: config.vatBusPostingGroup || 'DOMESTIC',
    Customer_Posting_Group: config.customerPostingGroup || 'TRADE',
    Customer_Price_Group: config.customerPricingGroup || 'ONLINE',
    Customer_Disc_Group: config.customerDiscGroup || '',
    Partner_Type: sendVAT?.length === 7 ? 'Company' : 'Person',
    Payment_Terms_Code: config.paymentTermsCode || 'CASH',
    Payment_Method_Code: config.paymentMethodCode || 'CASH',
    Location_Code: config.locationCode || 'BEV-01',
    Prices_Including_VAT: true,
    Allow_Line_Disc: true,
  };

  try {
    let responseData;

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, username, password } = config;

    const response = await fetch(
      `${customerApi}?$filter=Phone_No eq '${customer.primaryPhone}'`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
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

export const dealToDynamic = async (subdomain, syncLog, params, models) => {
  const configs = await getConfig(subdomain, 'DYNAMIC', {});
  const config = configs[params.scopeBrandIds[0] || 'noBrand'];

  const order = params;

  try {
    let responseData;
    let customer;

    if (
      !config.customerApi ||
      !config.salesApi ||
      !config.salesLineApi ||
      !config.username ||
      !config.password
    ) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, salesApi, salesLineApi, username, password } = config;

    if (order && order.customerId) {
      customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {},
      });

      if (order.customerType === 'company') {
        customer = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: { _id: order.customerId },
          isRPC: true,
          defaultValue: {},
        });
      }
    }

    if (customer) {
      const responseCustomer = await fetch(
        `${customerApi}?$filter=Phone_No eq '${customer.primaryPhone}'`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`,
            ).toString('base64')}`,
          },
        },
      ).then((r) => r.json());

      if (responseCustomer.value.length === 0) {
        responseData = await fetch(customerApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`,
            ).toString('base64')}`,
          },
          body: JSON.stringify('sendData'),
        }).then((r) => r.json());

        const brandIds = (customer || {}).scopeBrandIds || [];

        if (
          !brandIds.includes(params.scopeBrandIds[0]) &&
          params.scopeBrandIds[0] !== 'noBrand'
        ) {
          brandIds.push(params.scopeBrandIds[0]);
        }

        if (order.customerType === 'company') {
          await sendContactsMessage({
            subdomain,
            action: 'companies.updateCompany',
            data: { _id: customer._id, doc: { scopeBrandIds: brandIds } },
            isRPC: true,
          });
        } else {
          await sendContactsMessage({
            subdomain,
            action: 'customers.updateCustomer',
            data: { _id: customer._id, doc: { scopeBrandIds: brandIds } },
            isRPC: true,
          });
        }
      }
    }

    const sendData: any = {
      Sell_to_Customer_No: customer ? customer.code : 'BEV-00499',
      Sell_to_Phone_No: customer ? customer.primaryPhone : '',
      Sell_to_E_Mail: customer ? customer.primaryEmail : '',
      External_Document_No: 'nemelt medeelel',
      Responsibility_Center: config.responsibilityCenter || 'BEV-DIST',
      Sync_Type: config.syncType || 'ECOMMERCE',
      Mobile_Phone_No: customer ? customer.primaryPhone : '',
      VAT_Bus_Posting_Group: config.vatBusPostingGroup || 'DOMESTIC',
      Payment_Terms_Code: config.paymentTermsCode || '28TH',
      Payment_Method_Code: config.paymentMethodCode || 'CASH',
      Customer_Price_Group: config.customerPricingGroup || 'ONLINE',
      Prices_Including_VAT: true,
      BillType: config.billType || 'Receipt',
      Location_Code: config.locationCode || 'BEV-01',
      CustomerNo:
        customer?.customFieldsDataByFieldCode?.vatCustomer?.value ||
        customer?.customFieldsDataByFieldCode?.vatCompany?.value,
    };

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          sendData,
          sendStr: JSON.stringify(sendData),
        },
      },
    );

    const responseSale = await fetch(`${salesApi}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
      body: JSON.stringify(sendData),
    }).then((res) => res.json());

    if (order && order.items.length > 0 && responseSale) {
      for (const item of order.items) {
        const product = await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: item.productId },
          isRPC: true,
        });

        const sendSalesLine: any = {
          Document_No: responseSale.No,
          Type: 'Item',
          No: product ? product.code : '',
          Quantity: item.count || 0,
          Unit_Price: item.unitPrice || 0,
          Location_Code: config.locationCode || 'BEV-01',
        };

        const responseSaleLine = await fetch(`${salesLineApi}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`,
            ).toString('base64')}`,
          },
          body: JSON.stringify(sendSalesLine),
        }).then((res) => res.json());
      }
    }

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          responseData: responseSale,
          responseStr: JSON.stringify(responseSale),
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
