import fetch from 'node-fetch';
import { IModels } from './connectionResolver';
import { sendCoreMessage, sendPosMessage } from './messageBroker';
import { ISyncLogDocument } from './models/definitions/dynamic';
import { getMsdCustomerInfo } from './utilsCustomer';
import { putCreateLog, putDeleteLog, putUpdateLog } from './logUtils';

interface ExchangeRateConfig {
  exchangeRateApi: string;
  username: string;
  password: string;
}

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true,
  });
};

export const consumeInventory = async (
  subdomain,
  config,
  doc,
  action,
  user
) => {
  const updateCode = action === 'delete' ? doc.code : doc.No;

  const product = await sendCoreMessage({
    subdomain,
    action: 'products.findOne',
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {},
  });

  const brandIds = (product || {}).scopeBrandIds || [];

  if ((action === 'update' && doc.No) || action === 'create') {
    const productCategory = await sendCoreMessage({
      subdomain,
      action: 'categories.findOne',
      data: { code: doc.Item_Category_Code },
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
      categoryId: productCategory?._id || product?.categoryId, // TODO: if product not exists and productCategory not found then category is null
      scopeBrandIds: brandIds,
      status: 'active',
    };

    if (product) {
      const updated = await sendCoreMessage({
        subdomain,
        action: 'products.updateProduct',
        data: { _id: product._id, doc: { ...document } },
        isRPC: true,
      });

      await putUpdateLog(
        subdomain,
        {
          type: 'product',
          object: product,
          newData: {
            ...doc,
            status: 'active',
          },
          updatedDocument: updated,
        },
        user
      );
    } else {
      const create = await sendCoreMessage({
        subdomain,
        action: 'products.createProduct',
        data: { doc: { ...document } },
        isRPC: true,
      });

      await putCreateLog(
        subdomain,
        {
          type: 'product',
          newData: {
            ...doc,
          },
          object: create,
        },
        user
      );
    }
  } else if (action === 'delete' && product) {
    const anotherBrandIds = brandIds.filter((b) => b && b !== config.brandId);
    if (anotherBrandIds.length) {
      const updated = await sendCoreMessage({
        subdomain,
        action: 'products.updateProduct',
        data: {
          _id: product._id,
          doc: { ...product, scopeBrandIds: anotherBrandIds },
        },
        isRPC: true,
      });

      await putUpdateLog(
        subdomain,
        {
          type: 'product',
          object: product,
          newData: {
            ...doc,
            status: 'active',
          },
          updatedDocument: updated,
        },
        user
      );
    } else {
      await sendCoreMessage({
        subdomain,
        action: 'products.removeProducts',
        data: { _ids: [product._id] },
        isRPC: true,
      });

      await putDeleteLog(subdomain, { type: 'product', object: product }, user);
    }
  }
};

export const consumeCategory = async (
  subdomain,
  config,
  categoryId,
  doc,
  action
) => {
  const updateCode = action === 'delete' ? doc.code : doc.Code;

  const productCategory = await sendCoreMessage({
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
      code: doc?.Code,
      name: doc?.Description || 'default',
      scopeBrandIds: brandIds,
      parentId: categoryId,
      status: 'active',
    };

    if (doc.Parent_Category) {
      const parentCategory = await sendCoreMessage({
        subdomain,
        action: 'categories.findOne',
        data: { code: doc.Parent_Category },
        isRPC: true,
      });

      if (parentCategory) {
        document.parentId = parentCategory._id;
      }
    }

    if (productCategory) {
      await sendCoreMessage({
        subdomain,
        action: 'categories.updateProductCategory',
        data: { _id: productCategory._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: 'categories.createProductCategory',
        data: { doc: { ...document } },
        isRPC: true,
      });
    }
  } else if (action === 'delete' && productCategory) {
    await sendCoreMessage({
      subdomain,
      action: 'categories.removeProductCategory',
      data: { _id: productCategory._id },
      isRPC: true,
    });
  }
};

export const dealToDynamic = async (
  subdomain: string,
  syncLog: ISyncLogDocument,
  params: any,
  models: IModels,
  configs: any
) => {
  const order = params;
  const brandId = order.scopeBrandIds[0];
  const config = configs[brandId || 'noBrand'];

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
        'base64'
      )}`,
    };

    if (order?.customerId) {
      const msdCustomerInfo = await getMsdCustomerInfo(
        subdomain,
        models,
        order.customerId,
        order.customerType,
        brandId,
        config
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
      Salesperson_Code:
        config.title === 'Beverage'
          ? msdCustomer?.Salesperson_Code || '3144'
          : '',
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
      }
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
      const products = await sendCoreMessage({
        subdomain,
        action: 'products.find',
        data: { _id: { $in: order.items.map((item) => item.productId) } },
        isRPC: true,
      });

      const productById = {};

      for (const product of products) {
        productById[product._id] = product;
      }

      for (const item of order.items) {
        let lineUrlP = '';
        let linePostMethod = 'POST';
        let linePostHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
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
            }
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
          Unit_Price: item.unitPrice || 0,
          Location_Code: config.locationCode || 'BEV-01',
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
          }
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
            }
          );
        }

        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          {
            $push: {
              responseSales: JSON.stringify(responseSaleLine),
            },
          }
        );
        lineNoById[item._id] = lineNo || responseSaleLine.Line_No;
      }
    }

    await sendPosMessage({
      subdomain,
      action: 'orders.updateOne',
      data: {
        selector: { _id: params._id },
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
      isRPC: true,
    });

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          responseData: responseSale,
          responseStr: JSON.stringify(responseSale),
        },
      }
    );

    return responseSale;
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
    console.log(e, 'error');
  }
};

const getPriceForList = (prods, exchangeRates) => {
  let resProd = prods[0];
  let resPrice = prods[0].Price_Inc_CityTax_and_VAT || prods[0].Unit_Price;
  let resCurrencyCode = prods[0].Currency_Code;

  const hasDateList = prods.filter(
    (p) => p.Ending_Date && p.Ending_Date !== '0001-01-01'
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
      parseFloat(convertedPrice.toString().replace(/,/g, ''))
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
      (p) => !sorts.includes(p.Sales_Code)
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
            `${username}:${password}`
          ).toString('base64')}`,
        },
        timeout: 180000,
      }
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

    const result = Object.fromEntries(
      Object.entries(latestByCurrency).map(([key, value]) => [
        key,
        value.Special_Curr_Exch_Rate,
      ])
    );

    return result;
  } catch (e) {
    console.error('Failed to fetch exchange rates:', e);
  }
};
