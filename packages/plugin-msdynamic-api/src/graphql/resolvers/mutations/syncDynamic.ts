import fetch from "node-fetch";
import { generateModels } from "../../../connectionResolver";
import {
  IContext,
  sendPosMessage,
  sendCoreMessage
} from "../../../messageBroker";
import {
  consumeCategory,
  consumeInventory,
  dealToDynamic,
  getConfig,
  getPrice
} from "../../../utils";
import { consumeCustomers } from "../../../utilsCustomer";

const msdynamicSyncMutations = {
  async toSyncMsdProducts(
    _root,
    {
      brandId,
      action,
      products
    }: { brandId: string; action: string; products: any[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    switch (action) {
      case "CREATE": {
        for (const product of products) {
          try {
            await consumeInventory(subdomain, config, product, "create");
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      case "UPDATE": {
        for (const product of products) {
          try {
            await consumeInventory(subdomain, config, product, "update");
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      case "DELETE": {
        for (const product of products) {
          try {
            await consumeInventory(subdomain, config, product, "delete");
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      default:
        break;
    }

    return {
      status: "success"
    };
  },

  async toSyncMsdPrices(
    _root,
    { brandId }: { brandId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    const updatePrices: any[] = [];
    const createPrices: any[] = [];
    const error: any[] = [];
    const deletePrices: any[] = [];
    const matchPrices: any[] = [];

    if (!config.priceApi || !config.username || !config.password) {
      throw new Error("MS Dynamic config not found.");
    }

    const { priceApi, username, password, pricePriority } = config;

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

      const salesCodeFilter = pricePriority
        .replace(", ", ",")
        .split(",")
        .filter(p => p);

      let filterSection = "";

      for (const price of salesCodeFilter) {
        filterSection += `Sales_Code eq '${price}' or `;
      }

      const response = await fetch(
        `${priceApi}?$filter=${filterSection} Sales_Code eq ''`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString("base64")}`
          }
        }
      ).then(res => res.json());

      const groupedItems = {};

      if (response && response.value.length > 0) {
        for (const item of response.value) {
          const { Item_No } = item;

          if (!groupedItems[Item_No]) {
            groupedItems[Item_No] = [];
          }

          groupedItems[Item_No].push({ ...item });
        }
      }

      const productsByCode = {};
      // delete price
      for (const product of products) {
        if (!groupedItems[product.code]) {
          deletePrices.push(product);
        } else {
          productsByCode[product.code] = product;
        }
      }

      // update price
      for (const Item_No in groupedItems) {
        const resProds = groupedItems[Item_No];
        try {
          const { resPrice, resProd } = await getPrice(resProds, pricePriority);

          if (!resProd.Item_No) {
            error.push(resProds[0]);
          }

          const foundProduct = productsByCode[Item_No];
          if (foundProduct) {
            if (foundProduct.unitPrice === resPrice) {
              matchPrices.push(resProd);
            } else {
              await sendCoreMessage({
                subdomain,
                action: "products.updateProduct",
                data: {
                  _id: foundProduct._id,
                  doc: { unitPrice: resPrice || 0 }
                },
                isRPC: true
              });
              updatePrices.push(resProd);
            }
          } else {
            createPrices.push(resProd);
          }
        } catch (e) {
          console.log(e, "error");
          error.push(resProds[0]);
        }
      }
    } catch (e) {
      console.log(e, "error");
    }

    return {
      create: {
        count: createPrices.length,
        items: createPrices
      },
      error: {
        count: error.length,
        items: error
      },
      match: {
        count: matchPrices.length,
        items: matchPrices
      },
      update: {
        count: updatePrices.length,
        items: updatePrices
      },
      delete: {
        count: deletePrices.length,
        items: deletePrices
      }
    };
  },

  async toSyncMsdProductCategories(
    _root,
    {
      brandId,
      action,
      categoryId,
      categories
    }: {
      brandId: string;
      action: string;
      categoryId: string;
      categories: any[];
    },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    switch (action) {
      case "CREATE": {
        for (const category of categories) {
          try {
            await consumeCategory(
              subdomain,
              config,
              categoryId,
              category,
              "create"
            );
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      case "UPDATE": {
        for (const category of categories) {
          try {
            await consumeCategory(
              subdomain,
              config,
              categoryId,
              category,
              "update"
            );
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      case "DELETE": {
        for (const category of categories) {
          try {
            await consumeCategory(subdomain, config, "", category, "delete");
          } catch (e) {
            console.log(e, "error");
          }
        }
        break;
      }
      default:
        break;
    }

    return {
      status: "success"
    };
  },

  async toSyncMsdCustomers(
    _root,
    {
      brandId,
      action,
      customers
    }: { brandId: string; action: string; customers: any[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, "DYNAMIC", {});
    const config = configs[brandId || "noBrand"];

    try {
      switch (action) {
        case "CREATE": {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, "create");
          }
          break;
        }
        case "UPDATE": {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, "update");
          }
          break;
        }
        case "DELETE": {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, "delete");
          }
          break;
        }
        default:
          break;
      }

      return {
        status: "success"
      };
    } catch (e) {
      console.log(e, "error");
    }
  },

  // umnuh ni buren butelgui bolson buyu NO avaagui bol dahij ilgeej baigaa
  async toSendMsdOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext
  ) {
    let response = {} as any;
    const order = await sendPosMessage({
      subdomain,
      action: "orders.findOne",
      data: { _id: { $in: orderIds } },
      isRPC: true,
      defaultValue: []
    });

    const syncLogDoc = {
      contentType: "pos:order",
      createdAt: new Date(),
      createdBy: user._id
    };

    const models = await generateModels(subdomain);

    const syncLog = await models.SyncLogs.syncLogsAdd({
      ...syncLogDoc,
      contentId: order._id,
      consumeData: order,
      consumeStr: JSON.stringify(order)
    });

    try {
      const configs = await getConfig(subdomain, "DYNAMIC", {});
      response = await dealToDynamic(subdomain, syncLog, order, models, configs);
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
    }

    return {
      _id: order._id,
      isSynced: true,
      syncedDate: response.Order_Date,
      syncedBillNumber: response.No,
      syncedCustomer: response.Sell_to_Customer_No
    };
  }
};

export default msdynamicSyncMutations;
