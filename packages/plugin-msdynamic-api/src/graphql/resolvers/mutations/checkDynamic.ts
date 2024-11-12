import fetch from "node-fetch";
import {
  IContext,
  sendPosMessage,
  sendCoreMessage
} from "../../../messageBroker";
import { getConfig } from "../../../utils";

const msdynamicCheckMutations = {
  async toCheckMsdProducts(
    _root,
    { brandId }: { brandId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    const updateProducts: any = [];
    const createProducts: any = [];
    const deleteProducts: any = [];
    let matchedCount = 0;

    if (!config.itemApi || !config.username || !config.password) {
      throw new Error("MS Dynamic config not found.");
    }

    const { itemApi, username, password } = config;

    const productQry: any = { status: { $ne: "deleted" } };
    if (brandId && brandId !== "noBrand") {
      productQry.scopeBrandIds = { $in: [brandId] };
    } else {
      productQry.$or = [
        { scopeBrandIds: { $exists: false } },
        { scopeBrandIds: { $size: 0 } }
      ];
    }

    try {
      const products = await sendCoreMessage({
        subdomain,
        action: "products.find",
        data: {
          query: productQry,
        },
        isRPC: true
      });

      const productCodes = (products || []).map(p => p.code) || [];

      const response = await fetch(
        `${itemApi}?$filter=Item_Category_Code ne '' and Blocked ne true and Allow_Ecommerce eq true`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString("base64")}`
          },
          timeout: 180000
        }
      ).then(res => res.json());

      const resultCodes = response.value.map(r => r.No) || [];

      const productByCode = {};
      for (const product of products) {
        productByCode[product.code] = product;

        if (!resultCodes.includes(product.code)) {
          deleteProducts.push(product);
        }
      }

      for (const resProd of response.value) {
        if (productCodes.includes(resProd.No)) {
          const product = productByCode[resProd.No];

          if (
            resProd?.Description === product.name &&
            resProd?.Base_Unit_of_Measure === product.uom
          ) {
            matchedCount = matchedCount + 1;
          } else {
            updateProducts.push(resProd);
          }
        } else {
          createProducts.push(resProd);
        }
      }
    } catch (e) {
      console.log(e, "error");
    }

    return {
      create: {
        count: createProducts.length,
        items: createProducts
      },
      update: {
        count: updateProducts.length,
        items: updateProducts
      },
      delete: {
        count: deleteProducts.length,
        items: deleteProducts
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toCheckMsdProductCategories(
    _root,
    { brandId, categoryId }: { brandId: string; categoryId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    const updateCategories: any = [];
    const createCategories: any = [];
    const deleteCategories: any = [];
    let matchedCount = 0;

    if (!config.itemCategoryApi || !config.username || !config.password) {
      throw new Error("MS Dynamic config not found.");
    }

    const { itemCategoryApi, username, password } = config;

    try {
      const categoriesCount = await sendCoreMessage({
        subdomain,
        action: "categories.count",
        data: { query: { status: { $ne: "deleted" } } },
        isRPC: true
      });

      const categories = await sendCoreMessage({
        subdomain,
        action: "categories.find",
        data: {
          query: { status: { $ne: "deleted" } },
          limit: categoriesCount
        },
        isRPC: true
      });

      const response = await fetch(itemCategoryApi, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`
        }
      }).then(res => res.json());

      const resultCodes = response.value.map(r => r.Code) || [];

      const categoryByCode = {};
      const categoryById = {};
      for (const category of categories) {
        categoryByCode[category.code] = category;
        categoryById[category._id] = category;

        if (!resultCodes.includes(category.code)) {
          deleteCategories.push(category);
        }
      }

      for (const resProd of response.value) {
        const category = categoryByCode[resProd.Code];
        if (category) {
          if (
            resProd.Code === category.code &&
            (categoryId === category.parentId ||
              categoryById[category.parentId]?.code ===
              resProd.Parent_Category) &&
            category.name === resProd.Description
          ) {
            matchedCount = matchedCount + 1;
          } else {
            updateCategories.push(resProd);
          }
        } else {
          createCategories.push(resProd);
        }
      }
    } catch (e) {
      console.log(e, "error");
    }

    return {
      create: {
        count: createCategories.length,
        items: createCategories
      },
      update: {
        count: updateCategories.length,
        items: updateCategories
      },
      delete: {
        count: deleteCategories.length,
        items: deleteCategories
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toCheckMsdCustomers(
    _root,
    { brandId }: { brandId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    const createCustomers: any = [];
    const updateCustomers: any = [];
    const deleteCustomers: any = [];
    let matchedCount = 0;

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error("MS Dynamic config not found.");
    }

    const { customerApi, username, password } = config;

    try {
      const companies = await sendCoreMessage({
        subdomain,
        action: "companies.findActiveCompanies",
        data: {},
        isRPC: true,
        defaultValue: {}
      });

      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.findActiveCustomers",
        data: {},
        isRPC: true,
        defaultValue: {}
      });

      const companyCodes = (companies || []).map(c => c.code) || [];
      const customerCodes = (customers || []).map(c => c.code) || [];

      const response = await fetch(customerApi, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`
        },
        timeout: 60000
      }).then(res => res.json());

      const resultCodes =
        response.value.map(r => r.No.replace(/\s/g, "")) || [];

      const companyByCode = {};
      const customerByCode = {};

      for (const company of companies) {
        companyByCode[company.code] = company;

        if (!resultCodes.includes(company.code)) {
          deleteCustomers.push(company);
        }
      }

      for (const customer of customers) {
        customerByCode[customer.code] = customer;

        if (!resultCodes.includes(customer.code)) {
          deleteCustomers.push(customer);
        }
      }

      /* company and customer rquest function*/
      const companyRequest = resCompany => {
        if (companyCodes.includes(resCompany.No.replace(/\s/g, ""))) {
          const company = companyByCode[resCompany.No.replace(/\s/g, "")];

          if (resCompany?.Name === company.primaryName) {
            matchedCount = matchedCount + 1;
          } else {
            updateCustomers.push(resCompany);
          }
        } else {
          createCustomers.push(resCompany);
        }
      };

      const customerRequest = resCompany => {
        if (customerCodes.includes(resCompany.No.replace(/\s/g, ""))) {
          const customer = customerByCode[resCompany.No.replace(/\s/g, "")];

          if (resCompany?.Name === customer.firstName) {
            matchedCount = matchedCount + 1;
          } else {
            updateCustomers.push(resCompany);
          }
        } else {
          createCustomers.push(resCompany);
        }
      };

      /* ---------------------- */

      for (const resCompany of response.value) {
        if (resCompany?.Partner_Type === "Company") {
          companyRequest(resCompany);
        }

        if (resCompany?.Partner_Type === "Person") {
          if (resCompany.VAT_Registration_No.length === 7) {
            companyRequest(resCompany);
          } else {
            customerRequest(resCompany);
          }
        }

        if (
          resCompany?.Partner_Type === " " &&
          resCompany.VAT_Registration_No
        ) {
          companyRequest(resCompany);
        }

        if (
          resCompany?.Partner_Type === " " &&
          !resCompany.VAT_Registration_No
        ) {
          customerRequest(resCompany);
        }
      }
    } catch (e) {
      console.log(e, "error");
    }

    return {
      create: {
        count: createCustomers.length,
        items: createCustomers
      },
      update: {
        count: updateCustomers.length,
        items: updateCustomers
      },
      delete: {
        count: deleteCustomers.length,
        items: deleteCustomers
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toCheckMsdSynced(
    _root,
    { ids, brandId }: { ids: string[]; brandId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    if (!config.salesApi || !config.username || !config.password) {
      throw new Error("MS Dynamic config not found.");
    }

    const { salesApi, username, password } = config;

    let filterSection = "";
    let dynamicNo = [] as any;
    let dynamicId = [] as any;

    const orders = await sendPosMessage({
      subdomain,
      action: "orders.find",
      data: { _id: { $in: ids } },
      isRPC: true
    });

    for (const order of orders) {
      if (order.syncErkhetInfo) {
        let dynNo = "";
        try {
          const syncErkhetInfo = JSON.parse(order.syncErkhetInfo);
          dynNo = syncErkhetInfo.no;
        } catch {
          dynNo = order.syncErkhetInfo;
        }

        const obj = {};
        obj[dynNo] = order._id;

        dynamicNo.push(dynNo);
        dynamicId.push(obj);
      }
    }

    if (dynamicNo) {
      for (const no of dynamicNo) {
        filterSection += `No eq '${no}' or `;
      }

      filterSection = filterSection.slice(0, -4) + "";
    }

    const url = `${salesApi}?$filter=(${filterSection})`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          "base64"
        )}`
      },
      timeout: 60000
    }).then(r => r.json());

    const datas = response?.value;

    return (datas || []).map(data => {
      const key = data.No;
      const valueObject = dynamicId.find(obj => key in obj);

      return {
        _id: valueObject[key],
        isSynced: true,
        syncedDate: data.Order_Date,
        syncedBillNumber: data.No,
        syncedCustomer: data.Sell_to_Customer_No
      };
    });
  }
};

export default msdynamicCheckMutations;
