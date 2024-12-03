import { IOrder, IOrderDocument } from "../../models/definitions/orders";
import { IModels } from "../../connectionResolver";
import { IPayment } from "../resolvers/mutations/orders";
import { IOrderInput, IOrderItemInput } from "../types";
import { IOrderItemDocument } from "../../models/definitions/orderItems";
import {
  BILL_TYPES,
  ORDER_TYPES,
  ORDER_ITEM_STATUSES,
  PRODUCT_TYPES,
  SUBSCRIPTION_INFO_STATUS
} from "../../models/definitions/constants";
import {
  IConfigDocument,
  IConfig,
  IEbarimtConfig
} from "../../models/definitions/configs";
import * as moment from "moment";
import { debugError } from "@erxes/api-utils/src/debuggers";
import { IProductDocument } from "../../models/definitions/products";
import { checkLoyalties } from "./loyalties";
import { checkPricing } from "./pricing";
import { checkRemainders } from "./products";
import { getPureDate } from "@erxes/api-utils/src";
import { checkDirectDiscount } from "./directDiscount";
import { IPosUserDocument } from "../../models/definitions/posUsers";
import { sendCoreMessage } from "../../messageBroker";
import { nanoid } from "nanoid";
import { getCompanyInfo } from "../../models/PutData";

interface IDetailItem {
  count: number;
  amount: number;
  inventoryCode: string;
  barcode: string;
  productId: string;
}

export const generateOrderNumber = async (
  models: IModels,
  config: IConfig
): Promise<string> => {
  const todayStr = moment().format("YYYYMMDD").toString();

  const beginNumber =
    (config && config.beginNumber && `${config.beginNumber}.`) || "";

  let suffix = "0001";
  let number = `${todayStr}_${beginNumber}${suffix}`;

  let latestOrder;

  const latestOrders = await models.Orders.aggregate([
    {
      $match: {
        posToken: config.token,
        number: { $regex: new RegExp(`^${todayStr}_${beginNumber}*`) }
      }
    },
    {
      $project: {
        number: 1,
        number_len: { $strLenCP: "$number" }
      }
    },
    { $sort: { number_len: -1, number: -1 } },
    { $limit: 1 }
  ]);

  if (latestOrders.length) {
    latestOrder = latestOrders[0];
  }

  if (latestOrder && latestOrder._id) {
    const parts = latestOrder.number.split("_");

    const suffixParts = parts[1].split(".");
    const latestSuffix =
      (suffixParts.length === 2 && suffixParts[1]) || suffixParts[0];

    const latestNum = parseInt(latestSuffix, 10);
    const addend =
      (config &&
        config.maxSkipNumber &&
        config.maxSkipNumber > 1 &&
        Math.round(Math.random() * (config.maxSkipNumber - 1) + 1)) ||
      1;

    suffix = String(latestNum + addend).padStart(4, "0");
    number = `${todayStr}_${beginNumber}${suffix}`;
  }

  return number;
};

const validDueDate = (doc: IOrderInput, order?: IOrderDocument) => {
  if (!doc.isPre) {
    return true;
  }
  if (!doc.dueDate) {
    return false;
  }

  const now = getPureDate(new Date());
  if (doc.dueDate >= now) {
    return true;
  }

  if (order && order.isPre && order.dueDate && getPureDate(order.dueDate) !== getPureDate(doc.dueDate)) {
    return true;
  }

  return false;
}

export const validateOrder = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  doc: IOrderInput,
  order?: IOrderDocument
) => {
  const { items = [] } = doc;

  if (!items.filter(i => !i.isPackage).length) {
    throw new Error("Products missing in order. Please add products");
  }

  if (!await validDueDate(doc, order)) {
    throw new Error(
      "The due date of the pre-order must be recorded in the future"
    );
  }

  const products = await models.Products.find({
    _id: { $in: items.map(i => i.productId) }
  }).lean();
  const productIds = products.map(p => p._id);

  for (const item of items) {
    // will throw error if product is not found
    if (!productIds.includes(item.productId)) {
      throw new Error("Products missing in order");
    }
  }

  if (
    products.find(product => product?.type === PRODUCT_TYPES.SUBSCRIPTION) &&
    !doc?.customerId
  ) {
    throw new Error(
      "Please ensure that the customer information is included in the order, as there are subscription-based products within it."
    );
  }

  if (
    config.isCheckRemainder &&
    (doc.branchId || config.branchId) &&
    config.departmentId
  ) {
    const checkProducts = products.filter(
      p => (p.isCheckRems || {})[config.token || ""] || false
    );

    if (checkProducts.length) {
      const result = await checkRemainders(
        subdomain,
        config,
        checkProducts,
        doc.branchId || config.branchId
      );

      const errors: string[] = [];
      const withRemProductById = {};
      for (const product of result) {
        withRemProductById[product._id] = product;
      }

      for (const item of items) {
        const product = withRemProductById[item.productId];
        if (!product) {
          continue;
        }

        if (!doc.isPre && product.remainder < item.count) {
          errors.push(
            `#${product.code} - ${product.name} have a potential sales balance of ${product.remainder}`
          );
        }

        if (
          doc.isPre &&
          product.remainder + product.soonIn - product.soonOut < item.count
        ) {
          errors.push(
            `#${product.code} - ${product.name} have a potential sales limit of ${product.remainder}`
          );
        }
      }

      if (errors.length) {
        throw new Error(errors.join(", "));
      }
    }
  }
};

export const validateOrderPayment = (order: IOrder, doc: IPayment) => {
  if (order.paidDate) {
    throw new Error("Order has already been paid");
  }
  const {
    cashAmount: paidCash = 0,
    mobileAmount: paidMobile = 0,
    paidAmounts
  } = order;
  const { cashAmount = 0 } = doc;

  const paidTotal = Number(
    (
      paidCash +
      paidMobile +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0)
    ).toFixed(2)
  );
  // only remainder cash amount will come
  const total = Number(cashAmount.toFixed(2));

  if (total + paidTotal !== order.totalAmount) {
    throw new Error(`Paid amount does not match order's total amount`);
  }
};

export const cleanOrderItems = async (
  orderId: string,
  items: IOrderItemInput[],
  models: IModels
) => {
  const itemIds = items.map(item => item._id);

  await models.OrderItems.deleteMany({ orderId, isPackage: true });
  await models.OrderItems.deleteMany({ orderId, _id: { $nin: itemIds } });
};

export const updateOrderItems = async (
  orderId: string,
  items: IOrderItemInput[],
  models: IModels
) => {
  const oldItems = await models.OrderItems.find({
    _id: { $in: items.map(item => item._id) }
  }).lean();

  const itemIds = oldItems.map(i => i._id);

  for (const item of items) {
    const doc = {
      productId: item.productId,
      count: item.count,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
      bonusCount: item.bonusCount,
      bonusVoucherId: item.bonusVoucherId,
      isPackage: item.isPackage,
      isTake: item.isTake,
      manufacturedDate: item.manufacturedDate,
      description: item.description,
      attachment: item.attachment
    };

    if (itemIds.includes(item._id)) {
      await models.OrderItems.updateOrderItem(item._id, doc);
    } else {
      await models.OrderItems.createOrderItem({
        ...doc,
        orderId
      });
    }
  }
};

export const getTotalAmount = (items: IOrderItemInput[] = []): number => {
  let total = 0;

  for (const item of items) {
    total += (item.count || 0) * (item.unitPrice || 0);
  }

  return Number(total.toFixed(2));
};

const mathRound = (value, p = 2) => {
  if (!value || isNaN(Number(value))) {
    return 0;
  }

  let converter = 10 ** p;
  return Math.round(value * converter) / converter;
};

export const prepareEbarimtData = async (
  models: IModels,
  order: IOrderDocument,
  config: IEbarimtConfig,
  items: IOrderItemDocument[] = [],
  orderBillType?: string,
  registerNumber?: string
) => {
  const billType = orderBillType || order.billType || BILL_TYPES.CITIZEN;
  let type: string = billType === "3" ? "B2B_RECEIPT" : "B2C_RECEIPT";
  let customerTin = "";
  let customerCode = "";
  let customerName = "";

  if (registerNumber) {
    const resp = await getCompanyInfo({
      checkTaxpayerUrl: config.checkTaxpayerUrl,
      no: registerNumber
    });

    if (resp.status === "checked" && resp.tin) {
      type = "B2B_RECEIPT";
      customerTin = resp.tin;
      customerCode = registerNumber;
      customerName = resp.result?.data?.name;
    }
  }

  const productIds = items.map(item => item.productId);
  const products: IProductDocument[] = await models.Products.find({
    _id: { $in: productIds }
  }).lean();
  const productsById = {};

  for (const product of products) {
    productsById[product._id] = product;
  }

  return {
    contentType: "pos",
    contentId: order._id,
    number: order.number ?? "",

    date: new Date(),
    type,

    customerCode,
    customerName,
    customerTin,

    details: items
      .filter(item => {
        return Boolean(productsById[item.productId]);
      })
      .map(item => {
        const product: IProductDocument = productsById[item.productId];
        return {
          recId: item._id,
          product,
          quantity: item.count,
          unitPrice: item.unitPrice ?? 0,
          totalDiscount: item.discountAmount,
          totalAmount: mathRound(item.count * (item.unitPrice ?? 0), 4)
        };
      }),
    nonCashAmounts: [
      ...(order.paidAmounts || []),
      ...(order.mobileAmounts || [])
    ].map(pay => ({ amount: pay.amount }))
  };
};

const getMatchMaps = (matchOrders, lastCatProdMaps, product) => {
  for (const order of matchOrders) {
    const matchMaps = lastCatProdMaps.filter(
      lcp => lcp.category.order === order
    );

    if (matchMaps.length) {
      const withCodeMatch = matchMaps.find(
        m => m.code && product.code.includes(m.code)
      );
      if (withCodeMatch) {
        return withCodeMatch;
      }

      const withNameMatch = matchMaps.find(
        m => !m.code && m.name && product.name.includes(m.name)
      );
      if (withNameMatch) {
        return withNameMatch;
      }

      const normalMatch = matchMaps.find(m => !m.code && !m.name);
      if (normalMatch) {
        return normalMatch;
      }
    }
  }
  return;
};

const checkPrices = async (subdomain, preparedDoc, config, posUser) => {
  const { type } = preparedDoc;

  if (ORDER_TYPES.SALES.includes(type)) {
    preparedDoc = await checkLoyalties(subdomain, preparedDoc);
    preparedDoc = await checkPricing(subdomain, preparedDoc, config);
    preparedDoc = checkDirectDiscount(preparedDoc, config, posUser);
    return preparedDoc;
  }

  if (ORDER_TYPES.OUT.includes(type)) {
    for (const item of preparedDoc.items || []) {
      item.discountPercent = 100;
      item.discountAmount = item.count * item.unitPrice;
      item.unitPrice = 0;
    }
  }

  return preparedDoc;
};

export const prepareOrderDoc = async (
  subdomain: string,
  doc: IOrderInput,
  config: IConfigDocument,
  models: IModels,
  posUser?: IPosUserDocument
) => {
  const { catProdMappings = [] } = config;

  let subscriptionUoms: any[] = [];

  const items = doc.items.filter(i => !i.isPackage) || [];

  const products: IProductDocument[] = await models.Products.find({
    _id: { $in: items.map(i => i.productId) }
  }).lean();

  const productsOfId: { [_id: string]: IProductDocument } = {};

  for (const prod of products) {
    productsOfId[prod._id] = prod;
  }

  let subscriptionInfo;

  if (products.find(product => product?.type === PRODUCT_TYPES.SUBSCRIPTION)) {
    subscriptionUoms = await sendCoreMessage({
      subdomain,
      action: "uoms.find",
      data: { isForSubscription: true },
      isRPC: true,
      defaultValue: []
    });
  }

  // set unitPrice
  doc.totalAmount = 0;
  for (const item of items) {
    const fixedUnitPrice = Number(
      Number(
        (
          (productsOfId[item.productId] || {}).prices || {}
        )[config.token] ||
        item.unitPrice ||
        0
      ).toFixed(2)
    );

    item.unitPrice = isNaN(fixedUnitPrice) ? 0 : fixedUnitPrice;
    doc.totalAmount += (item.count || 0) * fixedUnitPrice;

    let startDate;

    if (
      productsOfId[item.productId]?.type === PRODUCT_TYPES.SUBSCRIPTION &&
      subscriptionUoms.find(
        uom => uom.code === productsOfId[item.productId]?.uom
      )
    ) {
      const { subscriptionConfig = {} } =
        subscriptionUoms.find(
          ({ code }) => code === productsOfId[item.productId]?.uom
        ) || {};

      if (subscriptionConfig?.subsRenewable) {
        const prevSubscription = await models.Orders.findOne({
          customerId: doc?.customerId,
          "subscriptionInfo.status": SUBSCRIPTION_INFO_STATUS.ACTIVE,
          paidDate: { $exists: true }
        })
          .sort({ createdAt: -1 })
          .lean();

        if (prevSubscription) {
          const prevSubscriptionItem = await models.OrderItems.findOne({
            orderId: prevSubscription._id,
            closeDate: { $gte: new Date() }
          });

          if (prevSubscriptionItem) {
            subscriptionInfo = {
              subscriptionId: prevSubscription.subscriptionInfo?.subscriptionId,
              status: SUBSCRIPTION_INFO_STATUS.ACTIVE,
              prevSubscriptionId: prevSubscription._id
            };

            startDate = prevSubscriptionItem?.closeDate;
          }
        }
      }
      const period = (subscriptionConfig?.period || "").replace("ly", "");

      item.closeDate = new Date(
        moment(startDate)
          .add(item.count || 0, period)
          .toISOString()
      );

      if (!subscriptionInfo) {
        subscriptionInfo = {
          subscriptionId: doc?.subscriptionId || nanoid(),
          status: SUBSCRIPTION_INFO_STATUS.ACTIVE
        };
      }
    }
  }

  const hasTakeItems = items.filter(i => i.isTake);

  if (hasTakeItems.length > 0 && catProdMappings.length > 0) {
    const toAddProducts = {};

    const mapCatIds = catProdMappings
      .filter(cpm => cpm.categoryId)
      .map(cpm => cpm.categoryId);
    const hasTakeProducIds = hasTakeItems.map(hti => hti.productId);
    const hasTakeCatIds = hasTakeProducIds.map(
      htpi => (productsOfId[htpi] || {}).categoryId
    );
    const categories = await models.ProductCategories.find({
      _id: { $in: [...mapCatIds, ...hasTakeCatIds] }
    }).lean();

    const categoriesOfId = {};
    for (const cat of categories) {
      categoriesOfId[cat._id] = cat;
    }
    const lastCatProdMaps = catProdMappings.map(cpm => ({
      ...cpm,
      category: categoriesOfId[cpm.categoryId]
    }));

    for (const item of hasTakeItems) {
      const product = productsOfId[item.productId];
      const category = categoriesOfId[product.categoryId || ""];

      if (!category) {
        continue;
      }

      const perOrders = category.order.split("/");
      const matchOrders: string[] = [];
      for (let i = perOrders.length - 1; i > 0; i--) {
        matchOrders.push(`${perOrders.slice(0, i).join("/")}/`);
      }

      const matchMap = getMatchMaps(matchOrders, lastCatProdMaps, product);
      if (matchMap) {
        const packProductId = matchMap.productId;
        if (packProductId) {
          if (!Object.keys(toAddProducts).includes(packProductId)) {
            toAddProducts[packProductId] = { count: 0 };
          }
          toAddProducts[packProductId].count += item.count;
        }
      }
    }

    const addProductIds = Object.keys(toAddProducts);

    if (addProductIds.length) {
      const takingProducts = await models.Products.find({
        _id: { $in: addProductIds }
      });

      for (const addProduct of takingProducts) {
        const toAddItem = toAddProducts[addProduct._id];

        const fixedUnitPrice = Number(
          ((addProduct.prices || {})[config.token] || 0).toFixed(2)
        );

        items.push({
          _id: Math.random().toString(),
          productId: addProduct._id,
          count: toAddItem.count,
          unitPrice: fixedUnitPrice,
          isPackage: true,
          isTake: true
        });

        doc.totalAmount += (toAddItem.count || 0) * fixedUnitPrice;
      }
    }
  }

  if (
    doc.type === ORDER_TYPES.DELIVERY &&
    config.deliveryConfig &&
    config.deliveryConfig.productId
  ) {
    const deliveryProd = await models.Products.findOne({
      _id: config.deliveryConfig.productId
    }).lean();

    if (deliveryProd) {
      const deliveryUnitPrice =
        (deliveryProd.prices || {})[config.token || ""] || 0;
      items.push({
        _id: Math.random().toString(),
        productId: deliveryProd._id,
        count: 1,
        unitPrice: deliveryUnitPrice,
        isPackage: true,
        isTake: true
      });
      doc.totalAmount += deliveryUnitPrice;
    }
  }

  return await checkPrices(
    subdomain,
    { ...doc, items, subscriptionInfo },
    config,
    posUser
  );
};

export const checkOrderStatus = (order: IOrderDocument) => {
  if (order.paidDate) {
    throw new Error("Order is already paid");
  }
};

export const checkOrderAmount = (order: IOrderDocument, amount: number) => {
  const { cashAmount = 0, mobileAmount = 0, paidAmounts } = order;

  const paidAmount =
    cashAmount +
    mobileAmount +
    (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

  if (amount < 0 && paidAmount < order.totalAmount) {
    throw new Error("Amount less 0");
  }

  if (amount > 0 && paidAmount > order.totalAmount) {
    throw new Error("Amount exceeds total amount");
  }

  if (
    paidAmount <= order.totalAmount &&
    paidAmount + amount > order.totalAmount
  ) {
    throw new Error("Amount exceeds total amount");
  }
};

export const reverseItemStatus = async (
  models: IModels,
  items: IOrderItemInput[]
) => {
  let newPreparedDocItems: IOrderItemInput[] = [...items];
  try {
    const oldOrderItems = await models.OrderItems.find({
      _id: { $in: items.map(item => item._id) }
    }).lean();
    if (oldOrderItems) {
      newPreparedDocItems.forEach(async (newItem, index) => {
        const foundItem = oldOrderItems.find(
          oldItem =>
            oldItem._id === newItem._id && oldItem.count < newItem.count
        );
        if (foundItem && foundItem._id) {
          newPreparedDocItems[index].status = ORDER_ITEM_STATUSES.CONFIRM;

          await models.OrderItems.updateOrderItem(foundItem._id, {
            ...foundItem,
            status: ORDER_ITEM_STATUSES.CONFIRM
          });
        }
      });
    }
    return newPreparedDocItems;
  } catch (e) {
    debugError(e);
    return e;
  }
};

export const fakePutData = async (
  models: IModels,
  items: IOrderItemDocument[],
  order: IOrderDocument,
  config: IConfig
) => {
  const products = await models.Products.find({
    _id: { $in: items.map(item => item.productId) }
  });
  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  return {
    id: "tempBill",
    number: order.number,
    contentType: "pos",
    contentId: order._id,
    posToken: config.token,
    totalAmount: order.totalAmount,
    totalVAT: 0,
    totalCityTax: 0,
    type: "9",
    status: "SUCCESS",
    qrData: "",
    lottery: "",
    date: moment(order.paidDate).format("yyyy-MM-dd hh:mm:ss"),

    cashAmount: order.cashAmount ?? 0,
    nonCashAmount: order.totalAmount - (order.cashAmount ?? 0),
    registerNo: "",
    customerNo: "",
    customerName: "",

    receipts: [
      {
        _id: "",
        id: "",
        totalAmount: order.totalAmount,
        totalVAT: 0,
        totalCityTax: 0,
        taxType: "NOT_SEND",
        items: items.map(item => ({
          _id: item._id,
          id: item.id,
          name:
            productById[item.productId].shortName ||
            productById[item.productId].name,
          measureUnit: productById[item.productId].uom || "ш",
          qty: item.count,
          unitPrice: item.unitPrice,
          totalAmount: (item.unitPrice ?? 0) * item.count,
          totalVAT: 0,
          totalCityTax: 0,
          totalBonus: item.discountAmount
        }))
      }
    ],
    payments: [{}]
  };
};
