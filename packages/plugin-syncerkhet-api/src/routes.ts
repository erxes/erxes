import { fixNum, getSubdomain } from "@erxes/api-utils/src/core";
import {
  sendSalesMessage,
  sendCoreMessage,
  sendPosMessage,
  sendPricingMessage
} from "./messageBroker";
import { getConfig } from "./utils/utils";

export const getOrderInfo = async (req, res) => {
  const subdomain = getSubdomain(req);
  const result: any = {};

  const { id } = req.query;

  const deal = await sendSalesMessage({
    subdomain,
    action: "deals.findOne",
    data: { _id: id },
    isRPC: true
  });

  if (deal && deal._id === id) {
    const conformities = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: id,
        relTypes: ["customer", "company"]
      },
      isRPC: true
    });

    result.type = "deal";
    result.object = deal;

    const customerIds = conformities
      .map(
        c =>
          (c.mainType === "customer" && c.mainTypeId) ||
          (c.relType === "customer" && c.relTypeId) ||
          ""
      )
      .filter(c => c);
    const companyIds = conformities
      .map(
        c =>
          (c.mainType === "company" && c.mainTypeId) ||
          (c.relType === "company" && c.relTypeId) ||
          ""
      )
      .filter(c => c);
    if (customerIds.length) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.find",
        data: { _id: { $in: customerIds } },
        isRPC: true
      });
      if (customers && customers.length) {
        result.customers = customers;
      }
    }
    if (companyIds.length) {
      const companies = await sendCoreMessage({
        subdomain,
        action: "companies.find",
        data: { _id: { $in: companyIds } },
        isRPC: true
      });
      if (companies && companies.length) {
        result.companies = companies;
      }
    }
    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: { _id: { $in: deal.productsData.map(p => p.productId) } },
        limit: deal.productsData.length
      }
    });
    result.products = products;

    return res.send(result);
  }

  const order = await sendPosMessage({
    subdomain,
    action: "orders.findOne",
    data: { _id: id },
    isRPC: true
  });

  if (order && order._id === id) {
    result.type = "order";
    result.object = order;
    if (order.customerId) {
      if (order.customerType === "company") {
        const companies = await sendCoreMessage({
          subdomain,
          action: "companies.find",
          data: { _id: { $in: [order.customerId] } },
          isRPC: true
        });
        if (companies && companies.length) {
          result.companies = companies;
        }
      } else if (order.customerType === "user") {
        const users = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: { query: { _id: order.customerId } },
          isRPC: true
        });
        if (users && users.length) {
          result.users = users;
        }
      } else {
        const customers = await sendCoreMessage({
          subdomain,
          action: "customers.find",
          data: { _id: { $in: [order.customerId] } },
          isRPC: true
        });
        if (customers && customers.length) {
          result.customers = customers;
        }
      }
    }

    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: { _id: { $in: order.items.map(p => p.productId) } },
        limit: order.items.length
      }
    });
    result.products = products;

    return res.send(result);
  }

  return res.send({});
};

export const calcPricing = async (req, res) => {
  const subdomain = getSubdomain(req);

  const {
    apiKey,
    unitPrices,
    apiSecret,
    counts,
    inventoryCodes
  } = req.body;

  const mainConfig = await getConfig(subdomain, 'ERKHET', {});

  if (!mainConfig?.apiKey || !mainConfig?.apiSecret || mainConfig?.apiKey !== apiKey || mainConfig?.apiSecret !== apiSecret) {
    return res.send();
  }

  const productsOn = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: {
      query: {
        code: { $in: inventoryCodes || [] }
      },
      field: { _id: 1 },
    },
    isRPC: true,
    defaultValue: []
  });

  const prodByCode = {};
  for (const prod of productsOn) {
    (inventoryCodes as string[]).indexOf(prod.code)
    prodByCode[prod.code] = prod;
  }


  const productsData: any[] = [];
  let totalAmount = 0;
  for (let i = 0; i < inventoryCodes.length; i++) {
    const prodId = prodByCode[inventoryCodes[i]]?._id;
    totalAmount += fixNum((counts[i] ?? 0) * (unitPrices[i] ?? 0));
    productsData.push({
      itemId: prodId || '',
      productId: prodId || '',
      quantity: counts[i] ?? 0,
      price: unitPrices[i] ?? 0,
    });
  }

  const checkedPrice = await sendPricingMessage({
    subdomain,
    action: 'checkPricing',
    data: {
      prioritizeRule: "exclude",
      totalAmount,
      products: productsData
    },
    isRPC: true,
    defaultValue: {}
  });

  const result: any = {};
  for (let i = 0; i < inventoryCodes.length; i++) {
    const invCode = inventoryCodes[i] || '';
    const prodId = prodByCode[invCode]?._id;
    const discountVals = checkedPrice[prodId];

    if (discountVals) {
      result[invCode] = fixNum(
        (discountVals.value * 100) / (unitPrices[i] ?? 1),
        8
      );
    }
  }

  return res.send( result );
};
