import fetch from 'node-fetch';
import { IModels } from '~/connectionResolvers';
import { ISyncLogDocument } from '~/modules/msdynamic/@types/dynamic';
import { getMsdCustomerInfo } from './utilsCustomer';
// import { putCreateLog, putDeleteLog, putUpdateLog } from './logUtils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

interface ExchangeRateConfig {
  exchangeRateApi: string;
  username: string;
  password: string;
}

export const getConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: any,
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'config',
    action: 'getConfig',
    method: 'query',
    input: { code, defaultValue },
    defaultValue,
  });
};

export const consumeInventory = async (
  subdomain: string,
  config: any,
  doc: any,
  action: string,
  user: any,
) => {
  const productCode = action === 'delete' ? doc.code : doc.No;

  const product = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'findOne',
    input: { code: productCode },
    defaultValue: null,
  });

  const brandIds = product?.scopeBrandIds || [];

  if (action === 'create' || action === 'update') {
    const productCategory = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'categories',
      action: 'findOne',
      input: { code: doc.Item_Category_Code },
      defaultValue: null,
    });

    if (
      config.brandId &&
      config.brandId !== 'noBrand' &&
      !brandIds.includes(config.brandId)
    ) {
      brandIds.push(config.brandId);
    }

    const document = {
      name: doc?.Description || 'default',
      shortName: doc?.Description_2 || '',
      type: doc.Type === 'Inventory' ? 'product' : 'service',
      unitPrice: doc?.Unit_Price || 0,
      code: doc.No,
      uom: doc?.Base_Unit_of_Measure || 'PCS',
      categoryId: productCategory?._id || null,
      scopeBrandIds: brandIds,
      status: 'active',
    };

    if (product) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'updateProduct',
        input: { _id: product._id, doc: document },
        defaultValue: {},
      });
    } else {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'createProduct',
        input: { doc: document },
        defaultValue: {},
      });
    }
  }

  if (action === 'delete' && product) {
    const remainingBrands = brandIds.filter(
      (b: string) => b !== config.brandId,
    );

    if (remainingBrands.length) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'updateProduct',
        input: {
          _id: product._id,
          doc: { scopeBrandIds: remainingBrands },
        },
        defaultValue: {},
      });
    } else {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'removeProducts',
        input: { _ids: [product._id] },
        defaultValue: {},
      });
    }
  }
};

export const consumeCategory = async (
  subdomain,
  config,
  categoryId,
  doc,
  action,
) => {
  const updateCode = action === 'delete' ? doc.code : doc.Code;

  const productCategory = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'categories',
    action: 'findOne',
    input: { code: updateCode },
    defaultValue: {},
  });

  const brandIds = (productCategory || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.Code) || action === 'create') {
    if (!brandIds.includes(config.brandId) && config.brandId !== 'noBrand') {
      brandIds.push(config.brandId);
    }

    const document: any = {
      code: doc?.Code,
      name: doc?.Description || 'default',
      scopeBrandIds: brandIds,
      parentId: categoryId,
      status: 'active',
    };

    if (doc.Parent_Category) {
      const parentCategory = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'categories',
        action: 'findOne',
        input: { code: doc.Parent_Category },
      });

      if (parentCategory) {
        document.parentId = parentCategory._id;
      }
    }

    if (productCategory) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'categories',
        action: 'updateProductCategory',
        input: { _id: productCategory._id, doc: { ...document } },
        defaultValue: {},
        // action: 'categories.updateProductCategory',
        // data: { _id: productCategory._id, doc: { ...document } },
        // isRPC: true,
      });
    } else {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'categories',
        action: 'createProductCategory',
        input: { doc: { ...document } },
        defaultValue: {},
        // action: 'categories.createProductCategory',
        // data: { doc: { ...document } },
        // isRPC: true,
      });
    }
  } else if (action === 'delete' && productCategory) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'categories',
      action: 'removeProductCategory',
      input: { _id: productCategory._id },
      defaultValue: null,
    });
  }
};

export const dealToDynamic = async (
  subdomain: string,
  models: IModels,
  syncLog: ISyncLogDocument,
  deal: any,
  config: any,
) => {
  const brandId = config.brandId;

  let msdCustomer: any = {};

  let orderMsdNo: string = '';
  let orderItemsMsdNo: any = {};
  const extraData = deal.extraData || {};
  const syncErkhetInfo = extraData.msdynamic || {};
  orderMsdNo = syncErkhetInfo.no;
  orderItemsMsdNo = syncErkhetInfo.lineNos || {};

  try {
    let customer;
    if (
      !config?.customerApi ||
      !config?.salesApi ||
      !config?.salesLineApi ||
      !config?.username ||
      !config?.password
    ) {
      throw new Error(`MS Dynamic config not found..., ${brandId}`);
    }
    const { salesApi, salesLineApi, username, password } = config;
    let urlParam = '';
    let lineUrlParam = '';
    let postMethod = 'POST';
    const postHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        'base64',
      )}`,
    };

    const conformities = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'conformities',
      action: 'findConformities',
      input: {
        mainType: 'deal',
        mainTypeId: { $in: deal._id },
      },
      defaultValue: [],
    });

    const customerType =
      conformities.length > 0 ? conformities[0].relType : 'customer';
    if (conformities.length > 0) {
      const msdCustomerInfo = await getMsdCustomerInfo(
        subdomain,
        models,
        conformities[0].relTypeId,
        customerType,
        brandId,
        config,
      );

      if (msdCustomerInfo) {
        msdCustomer = msdCustomerInfo.relation?.response;
        customer = msdCustomerInfo.customer;
      }
    }

    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: {
        _id: deal.assignedUserIds[0],
      },
      defaultValue: null,
    });

    let custCode = null;
    let userLocationCode = null;

    // sell_toCUstomer_no aa avahdaa currentUser iin customFieldsDatanaas aliig avahaa tohiruulsnii daguu avdag bolgohod bolno oo
    if (customerType === 'customer') {
      (user?.customFieldsData ?? []).forEach((field) => {
        if (field.field === config.custCode.fieldId) {
          custCode = field.value || null;
        }
        if (field.field === config.userLocationCode.fieldId) {
          userLocationCode = field.value || null;
        }
      });

      if (!orderMsdNo) {
        const subSendData: any = {
          Sell_to_Customer_No: custCode || config.defaultUserCode,
        };

        const subResponseSale = await fetch(`${salesApi}${urlParam}`, {
          method: postMethod,
          headers: postHeaders,
          body: JSON.stringify(subSendData),
        }).then((res) => res.json());

        orderMsdNo = subResponseSale.No;
      }
    }

    const rawDescription = deal.description.replace(/<\/?p>/g, '').trim();

    const sellAddress = rawDescription.slice(0, 100);
    const sellAddress2 = rawDescription.slice(100, 150);

    const sendData: any = {
      Sell_to_Customer_No:
        customerType === 'company'
          ? msdCustomer?.No || config.defaultUserCode
          : custCode || config.defaultUserCode,
      Sell_to_Phone_No: customer?.primaryPhone || '',
      Sell_to_E_Mail: customer?.primaryEmail || '',
      External_Document_No: deal.number || deal.name.split(':').pop().trim(),
      Responsibility_Center: config.responsibilityCenter || '',
      Sync_Type: config.syncType || '',
      Mobile_Phone_No: customer?.primaryPhone || '',
      VAT_Bus_Posting_Group: config.vatBusPostingGroup || '',
      Payment_Terms_Code: config.paymentTermsCode || '',
      Payment_Method_Code: config.paymentMethodCode || 'CASH',
      Customer_Price_Group: config.customerPricingGroup || '',
      Prices_Including_VAT: true,
      BillType: config.billType || 'Receipt',
      Location_Code: userLocationCode || config.locationCode || '',
      Deal_Type_Code: config.dealType || 'NORMAL',
      Salesperson_Code: user?.employeeId ?? '',
      Sell_to_Address: sellAddress,
      Sell_to_Address_2: sellAddress2,
      CustomerNo:
        customer?.customFieldsDataByFieldCode?.vatCustomer?.value ||
        customer?.customFieldsDataByFieldCode?.vatCompany?.value,
    };

    if (orderMsdNo) {
      urlParam = `(Document_Type='Order', No='${orderMsdNo}')`;
      lineUrlParam = `(Document_Type='Order',Document_No='${orderMsdNo}',Line_No=%Ln)`;
      postMethod = 'PATCH';
      postHeaders['If-Match'] = '*';
      sendData.No = orderMsdNo;
    }

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          sendData,
          sendStr: JSON.stringify(sendData),
        },
      },
    );

    if (!deal.productsData.length) {
      throw new Error('Order has no items');
    }

    const responseSale = await fetch(`${salesApi}${urlParam}`, {
      method: postMethod,
      headers: postHeaders,
      body: JSON.stringify(sendData),
    }).then((res) => res.json());
    const lineNoById = {};

    if (responseSale) {
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          _id: { $in: deal.productsData.map((item) => item.productId) },
        },
        defaultValue: [],
      });

      const productById = {};

      for (const product of products) {
        productById[product._id] = product;
      }

      let totalDiscount = 0;

      for (const item of deal.productsData) {
        let lineUrlP = '';
        let linePostMethod = 'POST';
        let linePostHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        };

        const lineNo = orderItemsMsdNo[item._id] || '';
        const product = productById[item.productId];

        if (!product) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            {
              $set: {
                error: `not found product ${product._id}`,
              },
            },
          );
          continue;
        }

        const sendSalesLine: any = {
          Document_No: responseSale.No,
          Type: 'Item',
          No: productById[item.productId]
            ? productById[item.productId].code
            : '',
          Quantity: item.quantity || 0,
          Location_Code: userLocationCode || config.locationCode || '',
        };

        if (lineNo) {
          lineUrlP = lineUrlParam.replace('%Ln', lineNo);
          linePostMethod = 'PATCH';
          linePostHeaders['If-Match'] = '*';
          sendSalesLine.Line_No = lineNo;
        }

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $push: {
              sendSales: JSON.stringify(sendSalesLine),
            },
          },
        );

        const responseSaleLine = await fetch(`${salesLineApi}${lineUrlP}`, {
          method: linePostMethod,
          headers: linePostHeaders,
          body: JSON.stringify(sendSalesLine),
        }).then((res) => res.json());

        if (responseSaleLine?.error?.message) {
          const foundSyncLog = (await models.SyncLogs.findOne({
            _id: syncLog._id,
          })) || { error: '' };
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            {
              $set: {
                error: `${foundSyncLog.error ? foundSyncLog.error : ''} - ${
                  responseSaleLine.error.message
                }`,
              },
            },
          );
        }

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $push: {
              responseSales: JSON.stringify(responseSaleLine),
            },
          },
        );
        lineNoById[item._id] = lineNo || responseSaleLine.Line_No;
        totalDiscount += item.discountAmount ?? 0;
      }

      const soapApiUrl = config.discountSoapApi; // "https://bc.erpmsm.mn:7047/MSM-Data/WS/Betastar%20LLC/Codeunit/PictureService";
      if (soapApiUrl && totalDiscount) {
        const soapHeaders = {
          'Content-Type': 'text/xml',
          SOAPAction:
            'urn:microsoft-dynamics-schemas/codeunit/PictureService:ReCalculateSalesOrderDiscount',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        };
        const soapDiscountSendData = `
          <?xml version="1.0"?>
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:microsoft-dynamics-schemas/codeunit/PictureService">
          <soapenv:Header/>
          <soapenv:Body>
            <tns:ReCalculateSalesOrderDiscount>
              <tns:code>${responseSale.No}</tns:code>
              <tns:invoiceDiscountAmount>${totalDiscount}</tns:invoiceDiscountAmount>
            </tns:ReCalculateSalesOrderDiscount>
          </soapenv:Body>
          </soapenv:Envelope>
        `;
        await fetch(`${soapApiUrl}`, {
          method: 'POST',
          headers: soapHeaders,
          body: soapDiscountSendData,
        });
      }
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'deals',
      action: 'updateOne',
      input: {
        selector: { _id: deal._id },
        modifier: {
          $set: {
            extraData: {
              ...(extraData || {}),
              msdynamic: {
                no: orderMsdNo || responseSale.No,
                lineNos: lineNoById,
              },
            },
          },
        },
      },
      defaultValue: {},
    });

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          responseData: responseSale,
          responseStr: JSON.stringify(responseSale),
        },
      },
    );

    return responseSale;
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
    console.log(e, 'error');
  }
};

export const orderToDynamic = async (
  subdomain: string,
  models: IModels,
  syncLog: ISyncLogDocument,
  order: any,
  config: any,
) => {
  const brandId = order.scopeBrandIds[0];

  let msdCustomer: any = {};

  let orderMsdNo: string = '';
  let orderItemsMsdNo: any = {};
  try {
    const syncErkhetInfo = JSON.parse(order.syncErkhetInfo);
    orderMsdNo = syncErkhetInfo.no;
    orderItemsMsdNo = syncErkhetInfo.lineNos || {};
  } catch {
    orderMsdNo = order.syncErkhetInfo;
  }

  try {
    let customer;

    if (
      !config?.customerApi ||
      !config?.salesApi ||
      !config?.salesLineApi ||
      !config?.username ||
      !config?.password
    ) {
      throw new Error(`MS Dynamic config not found..., ${brandId}`);
    }

    const { salesApi, salesLineApi, username, password } = config;
    let urlParam = '';
    let lineUrlParam = '';
    let postMethod = 'POST';
    const postHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        'base64',
      )}`,
    };

    if (order?.customerId) {
      const msdCustomerInfo = await getMsdCustomerInfo(
        subdomain,
        models,
        order.customerId,
        order.customerType,
        brandId,
        config,
      );
      if (msdCustomerInfo) {
        msdCustomer = msdCustomerInfo.relation?.response;
        customer = msdCustomerInfo.customer;
      }
    }

    const sendData: any = {
      Sell_to_Customer_No: msdCustomer?.No
        ? msdCustomer?.No
        : config.defaultUserCode,
      Sell_to_Phone_No: customer?.primaryPhone || '',
      Sell_to_E_Mail: customer?.primaryEmail || '',
      External_Document_No: order.number,
      Responsibility_Center: config.responsibilityCenter || '',
      Sync_Type: config.syncType || '',
      Mobile_Phone_No: customer?.primaryPhone || '',
      VAT_Bus_Posting_Group: config.vatBusPostingGroup || '',
      Payment_Terms_Code: config.paymentTermsCode || '',
      Payment_Method_Code: config.paymentMethodCode || 'CASH',
      Customer_Price_Group: config.customerPricingGroup || '',
      Prices_Including_VAT: true,
      BillType: config.billType || 'Receipt',
      Location_Code: config.locationCode || '',
      Deal_Type_Code: config.dealType || 'NORMAL',
      CustomerNo:
        customer?.customFieldsDataByFieldCode?.vatCustomer?.value ||
        customer?.customFieldsDataByFieldCode?.vatCompany?.value,
    };

    if (orderMsdNo) {
      urlParam = `(Document_Type='Order', No='${orderMsdNo}')`;
      lineUrlParam = `(Document_Type='Order',Document_No='${orderMsdNo}',Line_No=%Ln)`;
      postMethod = 'PATCH';
      postHeaders['If-Match'] = '*';
      sendData.No = orderMsdNo;
    }

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          sendData,
          sendStr: JSON.stringify(sendData),
        },
      },
    );

    if (!order.items.length) {
      throw new Error('Has not items order');
    }

    const responseSale = await fetch(`${salesApi}${urlParam}`, {
      method: postMethod,
      headers: postHeaders,
      body: JSON.stringify(sendData),
    }).then((res) => res.json());

    const lineNoById = {};

    if (responseSale) {
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: { _id: { $in: order.items.map((item) => item.productId) } },
        defaultValue: {},
      });

      const productById = {};

      for (const product of products) {
        productById[product._id] = product;
      }

      let totalDiscount = 0;

      for (const item of order.items) {
        let lineUrlP = '';
        let linePostMethod = 'POST';
        let linePostHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        };

        const lineNo = orderItemsMsdNo[item._id] || '';
        const product = productById[item.productId];

        if (!product) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            {
              $set: {
                error: `not found product ${product._id}`,
              },
            },
          );

          continue;
        }

        const sendSalesLine: any = {
          Document_No: responseSale.No,
          Type: 'Item',
          No: productById[item.productId]
            ? productById[item.productId].code
            : '',
          Quantity: item.count || 0,
          Location_Code: config.locationCode,
        };

        if (lineNo) {
          lineUrlP = lineUrlParam.replace('%Ln', lineNo);
          linePostMethod = 'PATCH';
          linePostHeaders['If-Match'] = '*';
          sendSalesLine.Line_No = lineNo;
        }

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $push: {
              sendSales: JSON.stringify(sendSalesLine),
            },
          },
        );

        const responseSaleLine = await fetch(`${salesLineApi}${lineUrlP}`, {
          method: linePostMethod,
          headers: linePostHeaders,
          body: JSON.stringify(sendSalesLine),
        }).then((res) => res.json());

        if (responseSaleLine?.error?.message) {
          const foundSyncLog = (await models.SyncLogs.findOne({
            _id: syncLog._id,
          })) || { error: '' };

          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            {
              $set: {
                error: `${foundSyncLog.error ? foundSyncLog.error : ''} - ${
                  responseSaleLine.error.message
                }`,
              },
            },
          );
        }

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $push: {
              responseSales: JSON.stringify(responseSaleLine),
            },
          },
        );
        lineNoById[item._id] = lineNo || responseSaleLine.Line_No;
        totalDiscount += item.discountAmount ?? 0;
      }

      const soapApiUrl = config.discountSoapApi; // "https://bc.erpmsm.mn:7047/MSM-Data/WS/Betastar%20LLC/Codeunit/PictureService";

      if (soapApiUrl && totalDiscount) {
        const soapHeaders = {
          'Content-Type': 'text/xml',
          SOAPAction:
            'urn:microsoft-dynamics-schemas/codeunit/PictureService:ReCalculateSalesOrderDiscount',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        };

        const soapDiscountSendData = `
          <?xml version="1.0"?>
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:microsoft-dynamics-schemas/codeunit/PictureService">
          <soapenv:Header/>
          <soapenv:Body>
            <tns:ReCalculateSalesOrderDiscount>
              <tns:code>${responseSale.No}</tns:code>
              <tns:invoiceDiscountAmount>${totalDiscount}</tns:invoiceDiscountAmount>
            </tns:ReCalculateSalesOrderDiscount>
          </soapenv:Body>
          </soapenv:Envelope>
        `;

        await fetch(`${soapApiUrl}`, {
          method: 'POST',
          headers: soapHeaders,
          body: soapDiscountSendData,
        });
      }
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'pos',
      module: 'orders',
      action: 'updateOne',
      input: {
        selector: { _id: order._id },
        modifier: {
          $set: {
            syncErkhetInfo: JSON.stringify({
              no: orderMsdNo || responseSale.No,
              lineNos: lineNoById,
            }),
            syncedErkhet: true,
          },
        },
      },
      defaultValue: {},
    });

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          responseData: responseSale,
          responseStr: JSON.stringify(responseSale),
        },
      },
    );

    return responseSale;
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
    console.log(e, 'error');
  }
};

const getPriceForList = (prods, exchangeRates) => {
  let resProd = prods[0];
  let resPrice = prods[0].Price_Inc_CityTax_and_VAT || prods[0].Unit_Price;
  let resCurrencyCode = prods[0].Currency_Code;

  const hasDateList = prods.filter(
    (p) => p.Ending_Date && p.Ending_Date !== '0001-01-01',
  );

  if (hasDateList.length) {
    resProd = hasDateList[0];
    resPrice =
      hasDateList[0].Price_Inc_CityTax_and_VAT || hasDateList[0].Unit_Price;

    for (const prod of hasDateList) {
      if (resPrice < (prod.Price_Inc_CityTax_and_VAT || prod.Unit_Price)) {
        continue;
      }

      resPrice = prod.Price_Inc_CityTax_and_VAT || prod.Unit_Price;
      resProd = prod;
      resCurrencyCode = prod.Currency_Code;
    }
  } else {
    for (const prod of prods) {
      if (resPrice < (prod.Price_Inc_CityTax_and_VAT || prod.Unit_Price)) {
        continue;
      }

      resPrice = prod.Price_Inc_CityTax_and_VAT || prod.Unit_Price;
      resProd = prod;
      resCurrencyCode = prod.Currency_Code;
    }
  }

  let convertedPrice = resPrice;

  if (exchangeRates[resCurrencyCode]) {
    convertedPrice *= exchangeRates[resCurrencyCode];

    convertedPrice = Math.round(
      parseFloat(convertedPrice.toString().replace(/,/g, '')),
    );
  }

  return { resPrice: convertedPrice, resProd };
};

export const getPrice = async (resProds, pricePriority, exchangeRates) => {
  try {
    const sorts = pricePriority.replace(/, /g, ',').split(',');

    const currentDate = new Date();

    const activeProds = resProds.filter((p) => {
      if (
        p.Starting_Date &&
        p.Starting_Date !== '0001-01-01' &&
        new Date(p.Starting_Date) > currentDate
      ) {
        return false;
      }

      if (
        p.Ending_Date &&
        p.Ending_Date !== '0001-01-01' &&
        new Date(p.Ending_Date) < currentDate
      ) {
        return false;
      }

      return true;
    });

    if (!activeProds.length) {
      return { resPrice: 0, resProd: {} };
    }

    for (const sortStr of sorts) {
      const onlineProds = activeProds.filter((a) => a.Sales_Code === sortStr);

      if (onlineProds.length) {
        return getPriceForList(onlineProds, exchangeRates);
      }
    }

    const otherFilter = activeProds.filter(
      (p) => !sorts.includes(p.Sales_Code),
    );

    if (!otherFilter.length) {
      return { resPrice: 0, resProd: {} };
    }

    return getPriceForList(otherFilter, exchangeRates);
  } catch (e) {
    console.log(e, 'error');
    return { resPrice: 0, resProd: {} };
  }
};

export const getExchangeRates = async (config: ExchangeRateConfig) => {
  if (!config.exchangeRateApi || !config.username || !config.password) {
    throw new Error('MS Dynamic config not found.');
  }

  const { exchangeRateApi, username, password } = config;

  try {
    const response = await fetch(
      `${exchangeRateApi}?$filter=Code eq  'PREPAID'`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
        timeout: 180000,
      },
    ).then((res) => res.json());

    if (!response.value || !Array.isArray(response.value)) {
      throw new Error('Invalid response format from exchange rate API');
    }

    const latestByCurrency: { [key: string]: any } = {};

    response.value.forEach((item) => {
      const currency = item.Currency_Code;
      if (
        !latestByCurrency[currency] ||
        new Date(item.Starting_Date) >
          new Date(latestByCurrency[currency].Starting_Date)
      ) {
        latestByCurrency[currency] = item;
      }
    });

    return Object.fromEntries(
      Object.entries(latestByCurrency).map(([key, value]) => [
        key,
        value.Special_Curr_Exch_Rate,
      ]),
    );
  } catch (e) {
    console.error('Failed to fetch exchange rates:', e);
  }
};
