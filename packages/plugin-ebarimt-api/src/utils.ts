import fetch from "node-fetch";
import {
  sendCoreMessage,
  sendNotificationsMessage,
  sendProductsMessage
} from "./messageBroker";

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: "send", data });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: "getConfig",
    data: { code, defaultValue },
    isRPC: true
  });
};

export const validCompanyCode = async (config, companyCode) => {
  let result = "";

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)/giu;

  if (re.test(companyCode)) {
    const response = await fetch(
      config.checkCompanyUrl + "?" + new URLSearchParams({ regno: companyCode })
    ).then(r => r.json());

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

  const config = await getConfig(subdomain, "EBARIMT", {});

  if (
    !config ||
    !config.checkCompanyUrl ||
    !config.checkCompanyUrl.includes("http")
  ) {
    return params;
  }

  const companyName = await validCompanyCode(config, params.code);

  if (!companyName) {
    return params;
  }

  if (companyName.includes("**") && params.primaryName) {
    return params;
  }

  params.primaryName = companyName;
  return params;
};

export const validConfigMsg = async config => {
  if (!config.url) {
    return "required url";
  }
  return "";
};

const getCustomerName = customer => {
  if (!customer) {
    return "";
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

  return "";
};

const billTypeCustomFieldsData = async (config, deal) => {
  if (
    config.dealBillType?.billType &&
    config.dealBillType?.regNo &&
    deal.customFieldsData?.length
  ) {
    const checkCompanyStrs = [
      "Байгууллага",
      "Company",
      "B2B",
      "B2B_RECEIPT",
      "3"
    ];

    const customDataBillType = deal.customFieldsData.find(
      cfd =>
        cfd.field === config.dealBillType.billType &&
        checkCompanyStrs.includes(cfd.value)
    );

    const customDataRegNo = deal.customFieldsData.find(
      cfd => cfd.field === config.dealBillType.regNo && cfd.value
    );

    const customDataComName = deal.customFieldsData.find(
      cfd => cfd.field === config.dealBillType.companyName && cfd.value
    );

    if (customDataBillType && customDataRegNo && customDataComName) {
      const resp = await getCompanyInfo({
        checkTaxpayerUrl: config.checkTaxpayerUrl,
        no: customDataRegNo.value
      });

      if (resp.status === "checked" && resp.tin) {
        return {
          type: "B2B_RECEIPT",
          customerCode: customDataRegNo.value,
          customerName: customDataComName.value,
          customerTin: resp.tin
        };
      }
    }
  }
};

const billTypeConfomityCompany = async (subdomain, config, deal) => {
  const companyIds = await sendCoreMessage({
    subdomain,
    action: "conformities.savedConformity",
    data: { mainType: "deal", mainTypeId: deal._id, relTypes: ["company"] },
    isRPC: true,
    defaultValue: []
  });

  if (companyIds.length > 0) {
    const companies = await sendCoreMessage({
      subdomain,
      action: "companies.findActiveCompanies",
      data: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1, primaryName: 1 }
      },
      isRPC: true,
      defaultValue: []
    });

    const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)|(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/gui;
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await getCompanyInfo({
          checkTaxpayerUrl: config.checkTaxpayerUrl,
          no: company.code
        });

        if (checkCompanyRes.status === "checked" && checkCompanyRes.tin) {
          return {
            type: "B2B_RECEIPT",
            customerCode: company.code,
            customerName: company.primaryName,
            customerTin: checkCompanyRes.tin
          };
        }
      }
    }
  }
};

const checkBillType = async (subdomain, config, deal) => {
  let type: "B2C_RECEIPT" | "B2B_RECEIPT" = "B2C_RECEIPT";
  let customerCode = "";
  let customerName = "";
  let customerTin = "";

  const checker = await billTypeCustomFieldsData(config, deal);
  if (checker?.type === "B2B_RECEIPT") {
    type = "B2B_RECEIPT";
    customerCode = checker.customerCode;
    customerName = checker.customerName;
    customerTin = checker.customerTin;
  }

  if (type === "B2C_RECEIPT") {
    const checkerC = await billTypeConfomityCompany(subdomain, config, deal);

    if (checkerC?.type === "B2B_RECEIPT") {
      type = "B2B_RECEIPT";
      customerCode = checkerC?.customerCode;
      customerName = checkerC?.customerName;
      customerTin = checkerC?.customerTin;
    }
  }

  if (type === "B2C_RECEIPT") {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: { mainType: "deal", mainTypeId: deal._id, relTypes: ["customer"] },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length > 0) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.findActiveCustomers",
        data: {
          selector: { _id: { $in: customerIds } },
          fields: {
            _id: 1,
            code: 1,
            firstName: 1,
            lastName: 1,
            primaryEmail: 1,
            primaryPhone: 1
          }
        },
        isRPC: true,
        defaultValue: []
      });

      let customer = customers.find(c => c.code && c.code.match(/^\d{8}$/g));

      if (customer) {
        customerCode = customer.code || "";
        customerName = getCustomerName(customer);
      } else {
        if (customers.length) {
          customer = customers[0];
          customerName = getCustomerName(customer);
        }
      }
    }
  }

  return { type, customerCode, customerName, customerTin };
};

export const getPostData = async (subdomain, config, deal) => {
  const { type, customerCode, customerName, customerTin } = await checkBillType(
    subdomain,
    config,
    deal
  );

  const productsIds = deal.productsData.map(item => item.productId);
  const products = await sendProductsMessage({
    subdomain,
    action: "products.find",
    data: { query: { _id: { $in: productsIds } }, limit: productsIds.length },
    isRPC: true,
    defaultValue: []
  });

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  return {
    contentType: "deal",
    contentId: deal._id,
    number: deal.number,

    date: new Date(),
    type,

    customerCode,
    customerName,
    customerTin,

    details: deal.productsData
      .filter(prData => prData.tickUsed)
      .map(prData => {
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
        };
      }),
    nonCashAmounts: Object.keys(deal.paymentsData || {}).map(pay => ({
      amount: deal.paymentsData[pay].amount
    }))
  };
};

export const getCompanyInfo = async ({ checkTaxpayerUrl, no }: { checkTaxpayerUrl: string, no: string }) => {
  const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
  if (tinre.test(no)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${checkTaxpayerUrl}/getInfo?tin=${no}`
    ).then(r => r.json());

    return { status: "checked", result, tin: no };
  }

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)/giu;

  if (!re.test(no)) {
    return { status: "notValid" };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${checkTaxpayerUrl}/getTinInfo?regNo=${no}`
  ).then(r => r.json());

  if (info.status !== 200) {
    return { status: "notValid" };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${checkTaxpayerUrl}/getInfo?tin=${tinNo}`
  ).then(r => r.json());

  return { status: "checked", result, tin: tinNo };
};

export const returnResponse = async (url, data) => {
  return await fetch(`${url}/rest/receipt`, {
    method: "DELETE",
    body: JSON.stringify({ ...data }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(async r => {
      if (r.status === 200) {
        return { status: 200 };
      }
      try {
        return r.json();
      } catch (e) {
        return {
          status: "ERROR",
          message: e.message
        };
      }
    })
    .catch(err => {
      return {
        status: "ERROR",
        message: err.message
      };
    });
};
