import {
  sendCoreMessage
} from "../messageBroker";
import { getCompanyInfo, getCoreConfig, getSyncLogDoc } from "./utils";

export const validConfigMsg = async config => {
  if (!config.url) {
    return "required url";
  }
  return "";
};

export const getPostData = async (
  subdomain,
  models,
  user,
  configs,
  deal,
  dateType = ""
) => {
  let billType = "1";
  let customerCode = "";
  let ebarimtTIN = "";

  const syncLogDoc = getSyncLogDoc({ type: "sales:deal", user, object: deal });

  const ebarimtConfig = await getCoreConfig(subdomain, "EBARIMT", {});

  if (
    ebarimtConfig.dealBillType?.billType &&
    ebarimtConfig.dealBillType?.regNo &&
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
        cfd.field === ebarimtConfig.dealBillType.billType &&
        checkCompanyStrs.includes(cfd.value)
    );
    const customDataRegNo = deal.customFieldsData.find(
      cfd => cfd.field === ebarimtConfig.dealBillType.regNo && cfd.value
    );
    const customDataComName = deal.customFieldsData.find(
      cfd => cfd.field === ebarimtConfig.dealBillType.companyName && cfd.value
    );

    if (customDataBillType && customDataRegNo && customDataComName) {
      const resp = await getCompanyInfo({
        checkTaxpayerUrl: ebarimtConfig.checkTaxpayerUrl,
        no: customDataRegNo.value
      });

      if (resp.status === "checked" && resp.tin) {
        billType = "3";
        ebarimtTIN = resp.tin;
      }
    }
  }

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
      customerCode = company.code;

      if (billType === "1" && re.test(company.code)) {
        const checkCompanyRes = await getCompanyInfo({
          checkTaxpayerUrl: ebarimtConfig.checkTaxpayerUrl,
          no: company.code
        });

        if (checkCompanyRes.status === "checked" && checkCompanyRes.tin) {
          billType = "3";
          break;
        }
      }
    }
  }

  if (billType === "1" || !customerCode) {
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
          fields: { _id: 1, code: 1 }
        },
        isRPC: true,
        defaultValue: []
      });

      customerCode = (customers.find(c => c.code) || {}).code || "";
    }
  }

  const assignUserIds = deal.assignedUserIds;

  for (const item of deal.productsData) {
    if (!item.assignUserId || assignUserIds.includes(item.assignUserId)) {
      continue;
    }

    assignUserIds.push(item.assignUserId);
  }

  const assignUsers = await sendCoreMessage({
    subdomain,
    action: "users.find",
    data: { query: { _id: { $in: assignUserIds } } },
    isRPC: true,
    defaultValue: []
  });

  const userEmailById = {};
  for (const user of assignUsers) {
    userEmailById[user._id] = user.email;
  }

  const productsIds = deal.productsData.map(item => item.productId);

  const products = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: {
      query: { _id: { $in: productsIds } },
      limit: deal.productsData.length
    },
    isRPC: true,
    defaultValue: []
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  const branchIds = deal.productsData.map(pd => pd.branchId) || [];
  const departmentIds = deal.productsData.map(pd => pd.departmentId) || [];

  const branchesById = {};
  const departmentsById = {};

  if (branchIds.length) {
    const branches = await sendCoreMessage({
      subdomain,
      action: "branches.find",
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
      action: "departments.find",
      data: { _id: { $in: departmentIds } },
      isRPC: true,
      defaultValue: []
    });

    for (const department of departments) {
      departmentsById[department._id] = department;
    }
  }

  const configBrandIds = Object.keys(configs);
  const detailByBrandId: any = {};

  for (const productData of deal.productsData) {
    // not tickUsed product not sent
    if (!productData.tickUsed) {
      continue;
    }

    // if wrong productId then not sent
    if (!productById[productData.productId]) {
      continue;
    }

    const product = productById[productData.productId];

    let otherCode: string = "";

    if (productData.branchId || productData.departmentId) {
      const branch = branchesById[productData.branchId || ""] || {};
      const department = departmentsById[productData.departmentId || ""] || {};
      otherCode = `${branch.code || ""}_${department.code || ""}`;
    }

    if (
      !(product.scopeBrandIds || []).length &&
      configBrandIds.includes("noBrand")
    ) {
      if (!detailByBrandId["noBrand"]) {
        detailByBrandId["noBrand"] = [];
      }
      detailByBrandId["noBrand"].push({
        count: productData.quantity,
        amount: productData.amount,
        discount: productData.discount,
        inventoryCode: product.code,
        otherCode,
        workerEmail:
          productData.assignUserId && userEmailById[productData.assignUserId]
      });
      continue;
    }

    for (const brandId of configBrandIds) {
      if (product.scopeBrandIds.includes(brandId)) {
        if (!detailByBrandId[brandId]) {
          detailByBrandId[brandId] = [];
        }

        detailByBrandId[brandId].push({
          count: productData.quantity,
          amount: productData.amount,
          discount: productData.discount,
          inventoryCode: product.code,
          otherCode,
          workerEmail:
            productData.assignUserId && userEmailById[productData.assignUserId]
        });
        continue;
      }
    }
  }

  let date = new Date().toISOString().slice(0, 10);
  let checkDate = false;

  switch (dateType) {
    case "lastMove":
      date = new Date(deal.stageChangedDate).toISOString().slice(0, 10);
      break;
    case "created":
      date = new Date(deal.createdAt).toISOString().slice(0, 10);
      break;
    case "closeOrCreated":
      date = new Date(deal.closeDate || deal.createdAt)
        .toISOString()
        .slice(0, 10);
      break;
    case "closeOrMove":
      date = new Date(deal.closeDate || deal.stageChangedDate)
        .toISOString()
        .slice(0, 10);
      break;
    case "firstOrMove":
      date = new Date(deal.stageChangedDate).toISOString().slice(0, 10);
      checkDate = true;
      break;
    case "firstOrCreated":
      date = new Date(deal.createdAt).toISOString().slice(0, 10);
      checkDate = true;
      break;
  }

  // debit payments coll
  const configure = {
    prepay: "preAmount",
    cash: "cashAmount",
    bank: "mobileAmount",
    pos: "cardAmount",
    wallet: "debtAmount",
    barter: "debtBarterAmount",
    after: "debtAmount",
    other: "debtAmount"
  };

  const postDatas: any[] = [];
  for (const brandId of Object.keys(detailByBrandId)) {
    const details = detailByBrandId[brandId];
    if (!details || !details.length) {
      continue;
    }

    const config = configs[brandId];
    const payments = {};

    if (config.hasPayment) {
      let sumSaleAmount = details.reduce((predet, detail) => {
        return { amount: predet.amount + detail.amount };
      }).amount;

      for (const paymentKind of Object.keys(deal.paymentsData || [])) {
        const payment = deal.paymentsData[paymentKind];
        payments[configure[paymentKind]] =
          (payments[configure[paymentKind]] || 0) + payment.amount;
        sumSaleAmount = sumSaleAmount - payment.amount;
      }

      // if payments is less sum sale amount then create debt
      if (sumSaleAmount > 0.005) {
        payments[config.defaultPay] =
          (payments[config.defaultPay] || 0) + sumSaleAmount;
      } else if (sumSaleAmount < -0.005) {
        if ((payments[config.defaultPay] || 0) > 0.005) {
          payments[config.defaultPay] =
            payments[config.defaultPay] + sumSaleAmount;
        } else {
          for (const key of Object.keys(payments)) {
            if (payments[key] > 0.005) {
              payments[key] = payments[key] + sumSaleAmount;
              continue;
            }
          }
        }
      }
    }

    const orderInfos = [
      {
        date,
        checkDate,
        orderId: deal._id,
        number: deal.number || "",
        hasVat: config.hasVat || false,
        hasCitytax: config.hasCitytax || false,
        billType,
        customerCode,
        ebarimtTIN,
        description: deal.name,
        workerEmail:
          (deal.assignedUserIds.length &&
            userEmailById[deal.assignedUserIds[0]]) ||
          undefined,
        details,
        ...payments
      }
    ];

    const syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

    postDatas.push({
      syncLog,
      postData: {
        userEmail: config.userEmail,
        token: config.apiToken,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        orderInfos: JSON.stringify(orderInfos)
      }
    });
  }

  return postDatas;
};
