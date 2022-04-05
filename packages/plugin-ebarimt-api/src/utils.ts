import { sendRequest } from "@erxes/api-utils/src";
import { sendCoreMessage, sendNotificationsMessage } from "./messageBroker";

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: "send", data });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: "getConfig",
    data: { code, defaultValue },
    isRPC: true,
  });
};

export const validCompanyCode = async (config, companyCode) => {
  let result = false;

  const re = new RegExp("(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)", "gui");

  if (re.test(companyCode)) {
    const response = await sendRequest({
      url: config.checkCompanyUrl,
      method: "GET",
      params: { regno: companyCode },
    });

    if (response.found) {
      result = response.name;
    }
  }
  return result;
};

export const companyCheckCode = async (user, models, params, subdomain) => {
  const config = await getConfig(subdomain, "EBARIMT", {});
  const company = params.updatedDocument || params.object;
  const companyName = await validCompanyCode(config, company.code);

  if (companyName) {
    if (company.primaryName !== companyName) {
      company.primaryName = companyName;

      await models.Companies.updateCompany(company._id, {
        company,
        primaryName: companyName,
        names: [companyName],
      });
    }
  } else {
    sendNotification(subdomain, {
      createdUser: user,
      receivers: [user._id],
      title: "wrong company code",
      content: `Байгууллагын код буруу бөглөсөн байна. "${company.code}"`,
      notifType: "companyMention",
      link: `/companies/details/${company._id}`,
      action: "update",
      contentType: "company",
      contentTypeId: company._id,
    });
  }
};

export const validConfigMsg = async (config) => {
  if (!config.url) {
    return "required url";
  }
  return "";
};

export const getPostData = async (models, config, deal) => {
  let billType = "1";
  let customerCode = "";
  let customerName = "";

  const companyIds = await models.Conformities.savedConformity({
    mainType: "deal",
    mainTypeId: deal._id,
    relTypes: ["company"],
  });
  if (companyIds.length > 0) {
    const companies =
      (await models.Companies.find({ _id: { $in: companyIds } })) || [];
    const re = new RegExp("(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)", "gui");
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await sendRequest({
          url: config.checkCompanyUrl,
          method: "GET",
          params: { regno: company.code },
        });

        if (checkCompanyRes.found) {
          billType = "3";
          customerCode = company.code;
          customerName = company.primaryName;
          continue;
        }
      }
    }
  }

  if (billType === "1") {
    const customerIds = await models.Conformities.savedConformity({
      mainType: "deal",
      mainTypeId: deal._id,
      relTypes: ["customer"],
    });
    if (customerIds.length > 0) {
      const customers = await models.Customers.find({
        _id: { $in: customerIds },
      });
      customerCode = customers.length > 0 ? customers[0].code : "" || "";
    }
  }

  const productsIds = deal.productsData.map((item) => item.productId);
  const products = await models.Products.find({ _id: { $in: productsIds } });

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  const details = [] as any;

  for (const productData of deal.productsData) {
    // not tickUsed product not sent
    if (!productData.tickUsed) {
      continue;
    }

    // if wrong productId then not sent
    if (!productsById[productData.productId]) {
      continue;
    }

    details.push({
      count: productData.quantity,
      amount: productData.amount,
      discount: productData.discount,
      inventoryCode: productsById[productData.productId].code,
      productId: productData.productId,
    });
  }

  let sumSaleAmount = details.reduce((predet, detail) => {
    return { amount: predet.amount + detail.amount };
  }).amount;

  const cashAmount = (deal.paymentsData || {}).cashAmount || 0;
  const nonCashAmount = sumSaleAmount - cashAmount;

  const orderInfo = {
    date: new Date().toISOString().slice(0, 10),
    orderId: deal._id,
    hasVat: config.hasVat || false,
    hasCitytax: config.hasCitytax || false,
    billType,
    customerCode,
    customerName,
    description: deal.name,
    details,
    cashAmount,
    nonCashAmount,
    ebarimtResponse: {},
  };

  return {
    ...orderInfo,
    productsById,
    contentType: "deal",
    contentId: deal._id,
  };
};
