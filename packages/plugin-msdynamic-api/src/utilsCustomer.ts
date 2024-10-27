import fetch from "node-fetch";
import { IModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";
import { getConfig } from "./utils";

const getCustomer = async (
  subdomain: string,
  customerId: string,
  customerType: string
) => {
  let customer;

  if (customerType === "company") {
    customer = await sendCoreMessage({
      subdomain,
      action: "companies.findOne",
      data: { _id: customerId },
      isRPC: true,
      defaultValue: {}
    });
  } else {
    customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: customerId },
      isRPC: true,
      defaultValue: {}
    });
  }

  return customer;
};

const getName = customer => {
  let name = customer.primaryName || "";
  name =
    name && customer.firstName
      ? name.concat(" ").concat(customer.firstName || "")
      : name || customer.firstName || "";

  name =
    name && customer.lastName
      ? name.concat(" ").concat(customer.lastName || "")
      : name || customer.lastName || "";

  return name || "";
};

const getSendDataCustomer = async (subdomain, customer, config) => {
  let foundfield;
  let sendVAT;
  let sendCity;
  let sendPostCode;
  let getCompanyName;

  if (customer && customer.customFieldsData.length > 0) {
    for (const field of customer.customFieldsData) {
      foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            _id: field.field
          }
        },
        isRPC: true
      });

      if (foundfield.text === "VAT") {
        sendVAT = field.value;
      }

      if (foundfield.text === "city") {
        sendCity = field.value;
      }

      if (foundfield.text === "post code") {
        sendPostCode = field.value;
      }
    }
  }

  if (sendVAT) {
    getCompanyName = await fetch(
      `https://ebarimt-bridge.erkhet.biz/getCompany?regno=${sendVAT}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(r => r.json());
  }

  const sendData: any = {
    Name: getName(customer) || "",
    Name_MN: getCompanyName?.name || "",
    Phone_No: customer.primaryPhone || "",
    E_Mail: customer.primaryEmail || "",
    Mobile_Phone_No: customer.primaryPhone || "",
    Address: customer.primaryAddress || "",
    Address_2: "",
    Country_Region_Code: "MN",
    City: sendCity || "Ulaanbaatar",
    Post_Code: sendPostCode || "",
    VAT_Registration_No: sendVAT || "",
    Gen_Bus_Posting_Group: config.genBusPostingGroup || "DOMESTIC",
    VAT_Bus_Posting_Group: config.vatBusPostingGroup || "DOMESTIC",
    Customer_Posting_Group: config.customerPostingGroup || "TRADE",
    Customer_Price_Group: config.customerPricingGroup || "ONLINE",
    Customer_Disc_Group: config.customerDiscGroup || "",
    Partner_Type: sendVAT?.length === 7 ? "Company" : "Person",
    Payment_Terms_Code: config.paymentTermsCode || "CASH",
    Payment_Method_Code: config.paymentMethodCode || "CASH",
    Location_Code: config.locationCode || "BEV-01",
    Prices_Including_VAT: true,
    Allow_Line_Disc: true
  };
  return sendData;
};

const checkSend = async (subdomain, customer, config, filterStr) => {
  const { customerApi, username, password } = config;

  const responseChecker = await fetch(
    `${customerApi}?$top=1$filter=${filterStr}`,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          "base64"
        )}`
      }
    }
  ).then(r => r.json());

  if (responseChecker.value?.length) {
    const msdValues = responseChecker.value[0];

    const name = getName(customer) || "";
    if (
      msdValues.Phone_No !== customer.primaryPhone ||
      msdValues.E_Mail !== customer.primaryEmail ||
      msdValues.Name !== name
    ) {
      return await fetch(`${customerApi}(No='${msdValues.No}')`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
          "If-Match": "*"
        },
        body: JSON.stringify({
          Phone_No: customer.primaryPhone,
          E_Mail: customer.primaryEmail,
          Name: name
        })
      }).then(r => r.json());
    }

    return msdValues;
  }

  const sendData = await getSendDataCustomer(subdomain, customer, config);

  return await fetch(customerApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        "base64"
      )}`
    },
    body: JSON.stringify(sendData)
  }).then(r => r.json());
};

export const getMsdCustomerInfo = async (
  subdomain: string,
  models: IModels,
  customerId: string,
  customerType: string,
  brandId: string,
  config
) => {
  let msdCustomer;
  let filterStr;
  const now = new Date();
  const relation = await models.CustomerRelations.findOne({
    customerId,
    brandId
  }).lean();

  const customer = await getCustomer(subdomain, customerId, customerType);

  if (relation) {
    const dayBefore = Math.round(
      (now.getTime() - relation.modifiedAt.getTime()) / (1000 * 3600 * 24)
    );

    if (dayBefore < 100) {
      return { relation, customer };
    }

    filterStr = `No eq '${relation.no}'`;
    msdCustomer = await checkSend(subdomain, customer, config, filterStr);
  } else {
    filterStr = `Phone_No eq '${customer.primaryPhone}'`;
    msdCustomer = await checkSend(subdomain, customer, config, filterStr);
  }

  const brandIds = customer?.scopeBrandIds || [];

  if (!brandIds.includes(brandId)) {
    brandIds.push(brandId);

    if (customerType === "company") {
      await sendCoreMessage({
        subdomain,
        action: "companies.updateCompany",
        data: { _id: customer._id, doc: { scopeBrandIds: brandIds } },
        isRPC: true
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: "customers.updateCustomer",
        data: {
          _id: customer._id,
          doc: {
            scopeBrandIds: brandIds
          }
        },
        isRPC: true
      });
    }
  }

  await models.CustomerRelations.updateOne(
    { customerId, brandId },
    {
      $set: {
        customerId,
        brandId,
        modifiedAt: now,
        no: msdCustomer.No,
        response: msdCustomer,
        filter: filterStr
      }
    },
    { upsert: true }
  );

  return {
    relation: await models.CustomerRelations.findOne({
      customerId,
      brandId
    }).lean(),
    customer
  };
};

export const customerToDynamic = async (subdomain, params, models) => {
  const configs = await getConfig(subdomain, "DYNAMIC", {});
  const brandIds = Object.keys(configs);

  for (const brandId of brandIds) {
    const config = configs[brandId || "noBrand"];

    if (!config?.customerApi || !config?.username || !config?.password) {
      continue;
    }

    const customer = params;

    await getMsdCustomerInfo(
      subdomain,
      models,
      customer._id,
      "customer",
      brandId,
      config
    );
  }
};

const companyRequest = async (subdomain, config, action, updateCode, doc) => {
  const company = await sendCoreMessage({
    subdomain,
    action: "companies.findOne",
    data: { $or: [{ code: updateCode }, { primaryName: doc.Name }] },
    isRPC: true,
    defaultValue: {}
  });

  let customFieldData = [] as any;
  let updateCustomFieldData;

  const brandIds = company?.scopeBrandIds || [];

  if ((action === "update" && doc.No) || action === "create") {
    if (!brandIds.includes(config.brandId) && config.brandId !== "noBrand") {
      brandIds.push(config.brandId);
    }

    if (doc.Post_Code) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "post code",
            contentType: "core:company"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.Post_Code
        });
      }
    }

    if (doc.City) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "city",
            contentType: "core:company"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.City
        });
      }
    }

    if (doc.VAT_Registration_No) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "VAT",
            contentType: "core:company"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.VAT_Registration_No
        });
      }
    }

    if (doc.Post_Code || doc.VAT_Registration_No || doc.City) {
      updateCustomFieldData = await sendCoreMessage({
        subdomain,
        action: "fields.prepareCustomFieldsData",
        data: customFieldData,
        isRPC: true
      });
    }

    const document: any = {
      primaryName: doc?.Name || "default",
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      location: doc?.Country_Region_Code === "MN" ? "Mongolia" : "",
      businessType: doc?.Partner_Type === "Person" ? "Customer" : "Partner",
      customFieldsData: updateCustomFieldData,
      scopeBrandIds: brandIds
    };

    if (company) {
      await sendCoreMessage({
        subdomain,
        action: "companies.updateCompany",
        data: { _id: company._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: "companies.createCompany",
        data: { ...document },
        isRPC: true
      });
    }
  }
};

const customerRequest = async (subdomain, config, action, updateCode, doc) => {
  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.findOne",
    data: { code: updateCode },
    isRPC: true,
    defaultValue: {}
  });

  let customFieldData = [] as any;
  let updateCustomFieldData;

  const brandIds = customer?.scopeBrandIds || [];

  if ((action === "update" && doc.No) || action === "create") {
    if (!brandIds.includes(config.brandId) && config.brandId !== "noBrand") {
      brandIds.push(config.brandId);
    }

    if (doc.Post_Code) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "post code",
            contentType: "core:customer"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.Post_Code
        });
      }
    }

    if (doc.City) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "city",
            contentType: "core:customer"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.City
        });
      }
    }

    if (doc.VAT_Registration_No) {
      const foundfield = await sendCoreMessage({
        subdomain,
        action: "fields.findOne",
        data: {
          query: {
            text: "VAT",
            contentType: "core:customer"
          }
        },
        isRPC: true
      });

      if (foundfield) {
        customFieldData.push({
          field: foundfield._id,
          value: doc.VAT_Registration_No
        });
      }
    }

    if (doc.Post_Code || doc.VAT_Registration_No || doc.City) {
      updateCustomFieldData = await sendCoreMessage({
        subdomain,
        action: "fields.prepareCustomFieldsData",
        data: customFieldData,
        isRPC: true
      });
    }

    const document: any = {
      firstName: doc?.Name || "default",
      code: doc.No,
      primaryPhone: doc?.Mobile_Phone_No,
      phones: [doc?.Phone_No],
      customFieldsData: updateCustomFieldData,
      scopeBrandIds: brandIds,
      state: "customer"
    };

    if (customer) {
      await sendCoreMessage({
        subdomain,
        action: "customers.updateCustomer",
        data: { _id: customer._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: "customers.createCustomer",
        data: { ...document },
        isRPC: true
      });
    }
  }
};

export const consumeCustomers = async (subdomain, config, doc, action) => {
  const updateCode = action === "delete" ? doc.code : doc.No.replace(/\s/g, "");

  if (doc?.Partner_Type === "Company") {
    companyRequest(subdomain, config, action, updateCode, doc);
  }

  if (doc?.Partner_Type === "Person") {
    if (doc.VAT_Registration_No.length === 7) {
      companyRequest(subdomain, config, action, updateCode, doc);
    } else {
      customerRequest(subdomain, config, action, updateCode, doc);
    }
  }

  if (doc?.Partner_Type === " " && doc.VAT_Registration_No) {
    companyRequest(subdomain, config, action, updateCode, doc);
  }

  if (doc?.Partner_Type === " " && !doc.VAT_Registration_No) {
    customerRequest(subdomain, config, action, updateCode, doc);
  }

  if (action === "delete") {
    const company = await sendCoreMessage({
      subdomain,
      action: "companies.findOne",
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {}
    });

    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: doc._id },
      isRPC: true,
      defaultValue: {}
    });

    if (action === "delete" && company) {
      await sendCoreMessage({
        subdomain,
        action: "companies.removeCompanies",
        data: { _ids: [company._id] },
        isRPC: true
      });
    }

    if (action === "delete" && customer) {
      await sendCoreMessage({
        subdomain,
        action: "customers.removeCustomers",
        data: { customerIds: [customer._id] }
      });
    }
  }
};
