import { sendCommonMessage, sendCoreMessage } from "../../messageBroker";

const removeEmptyValues = obj => {
  const newObj = {};

  for (const key in obj) {
    if (!Array.isArray(obj[key] || [])) {
      continue;
    }
    const value = (obj[key] || []).filter(k => k);

    if (value.length > 0) {
      newObj[key] = value;
    }
  }

  return newObj;
};

const getCustomFieldsDataWithValue = async (customFieldsData: any) => {
  const customFields: any[] = [];

  for (const customFieldData of customFieldsData || []) {
    const field = await sendCommonMessage({
      subdomain: "os",
      data: {
        query: {
          _id: customFieldData.field,
        },
      },
      serviceName: "forms",
      action: "fields.findOne",
      isRPC: true,
      defaultValue: [],
    });

    if (field) {
      customFields.push({
        text: field.text,
        data: customFieldData.value,
        code: field.code,
      });
    }
  }

  return customFields;
};

const getProducts = async deal => {
  const products: any[] = [];

  if (deal.productsData && deal.productsData.length > 0) {
    const product = await sendCommonMessage({
      subdomain: "os",
      data: { _id: deal.productsData[0].productId },
      action: "findOne",
      serviceName: "products",
      isRPC: true,
    });

    if (product) {
      products.push(product);
    }
  }
  return products;
};

const getAssignedUsers = async (deal: any) => {
  if (deal.assignedUserIds && deal.assignedUserIds.length > 0) {
    const assignedUsers = await sendCommonMessage({
      subdomain: "os",
      data: {
        query: {
          _id: deal.assignedUserIds,
        },
      },
      serviceName: "cards",
      action: "deals.find",
      defaultValue: [],
      isRPC: true,
    });

    return assignedUsers;
  }

  return [];
};

const getStage = async (deal: any) => {
  const stage = await sendCommonMessage({
    subdomain: "os",
    data: { _id: deal.stageId },
    action: "stages.findOne",
    serviceName: "cards",
    isRPC: true,
  });

  return stage;
};

const queries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  async dealsForRentpay(
    _root,
    {
      searchValue,
      ids,
      priceRange,
      district,
      customFields,
      customerIds,
      buyerIds,
      waiterIds,
      stageOrder,
      limit,
      skip,
    }
  ) {
    const filter: any = {};

    if (priceRange) {
      const prices = priceRange.split(",");

      filter.unitPrice = {
        $gte: parseInt(prices[0], 10),
      };

      if (prices.length === 2) {
        filter.unitPrice.$lte = parseInt(prices[1], 0);
      }
    }

    if (searchValue) {
      filter.description = new RegExp(`.*${searchValue}.*`, "i");
    }

    if (district) {
      const districts = district.split(",");

      const products = await sendCommonMessage({
        subdomain: "os",
        isRPC: true,
        data: { code: { $in: districts } },
        action: "categories.find",
        serviceName: "products",
        defaultValue: [],
      });

      const districtIds = products.map(p => p._id);

      const parentProducts = await sendCommonMessage({
        subdomain: "os",
        isRPC: true,
        data: { parentId: { $in: districtIds } },
        action: "categories.find",
        serviceName: "products",
        defaultValue: [],
      });

      const catIds = parentProducts.map(p => p._id);

      filter.categoryId = { $in: catIds };
    }

    let dealFilter: any = {};

    if (Object.keys(filter).length > 0) {
      const products = await sendCommonMessage({
        subdomain: "os",
        data: filter,
        action: "find",
        serviceName: "products",
        defaultValue: [],
        isRPC: true,
      });

      const productIds = products.map(p => p._id);

      dealFilter["productsData.productId"] = { $in: productIds };
    } else {
      dealFilter["productsData.0"] = { $exists: true };
    }

    if (customFields) {
      const newCustomFields = removeEmptyValues(customFields);

      const fields = Object.keys(newCustomFields);

      if (fields.length > 0) {
        dealFilter.$and = [];

        for (const field of fields) {
          let filter;

          if (newCustomFields[field].length === 1) {
            filter = {
              customFieldsData: {
                $elemMatch: {
                  field,
                  value: newCustomFields[field][0],
                },
              },
            };
          } else {
            filter = {
              $or: newCustomFields[field].map(value => ({
                customFieldsData: {
                  $elemMatch: {
                    field,
                    value,
                  },
                },
              })),
            };
          }

          dealFilter.$and.push(filter);
        }
      }
    }

    if (ids && ids.length > 0) {
      dealFilter = { _id: { $in: ids } };
    }

    if (customerIds && customerIds.length > 0) {
      const relIds = await sendCoreMessage({
        subdomain: "os",
        data: {
          mainType: "customer",
          mainTypeIds: customerIds,
          relType: "deal",
        },
        action: "conformities.filterConformity",
        isRPC: true,
        defaultValue: [],
      });

      if (relIds.length === 0) {
        return {
          list: [],
          totalCount: 0,
        };
      }

      dealFilter = { _id: { $in: relIds } };
    }

    if (buyerIds && buyerIds.length > 0) {
      const relIds = await sendCoreMessage({
        subdomain: "os",
        data: {
          mainType: "buyerCustomer",
          mainTypeIds: buyerIds,
          relType: "deal",
        },
        action: "conformities.filterConformity",
        isRPC: true,
        defaultValue: [],
      });

      if (relIds.length === 0) {
        return {
          list: [],
          totalCount: 0,
        };
      }

      dealFilter = { _id: { $in: relIds } };
    }

    if (waiterIds && waiterIds.length > 0) {
      const relIds = await sendCoreMessage({
        subdomain: "os",
        data: {
          mainType: "waiterCustomer",
          mainTypeIds: waiterIds,
          relType: "deal",
        },
        action: "conformities.filterConformity",
        isRPC: true,
        defaultValue: [],
      });

      if (relIds.length === 0) {
        return {
          list: [],
          totalCount: 0,
        };
      }

      dealFilter = { _id: { $in: relIds } };
    }

    if (stageOrder) {
      const stageFilter: any = {
        type: "deal",
        status: "active",
        order: stageOrder,
      };

      if (process.env.NODE_ENV === "production") {
        stageFilter.pipelineId = "QXjcMeP2kZ4W6oHED";
      }

      const stage = await sendCommonMessage({
        subdomain: "os",
        data: stageFilter,
        action: "stages.findOne",
        serviceName: "cards",
        defaultValue: [],
        isRPC: true,
      });

      dealFilter.stageId = stage._id;
    }

    const deals = await sendCommonMessage({
      subdomain: "os",
      data: {
        query: dealFilter,
        sort: { order: 1 },
        skip,
        limit,
      },
      action: "deals.find",
      serviceName: "cards",
      defaultValue: [],
      isRPC: true,
    });

    for (const deal of deals) {
      const { customFieldsData } = deal;

      deal.customFieldsData = await getCustomFieldsDataWithValue(
        customFieldsData
      );

      deal.assignedUsers = await getAssignedUsers(deal);

      deal.stage = await getStage(deal);

      deal.products = await getProducts(deal);
    }

    const totalCount = await sendCommonMessage({
      subdomain: "os",
      data: dealFilter,
      action: "deals.count",
      serviceName: "cards",
      defaultValue: 0,
      isRPC: true,
    });

    return {
      list: deals,
      totalCount,
    };
  },

  async dealDetailForRentpay(_root, { _id }) {
    const deal = await sendCommonMessage({
      subdomain: "os",
      isRPC: true,
      data: { _id },
      action: "deals.findOne",
      serviceName: "cards",
    });

    const { customFieldsData } = deal;

    deal.customFieldsData = await getCustomFieldsDataWithValue(
      customFieldsData
    );

    deal.products = await getProducts(deal);

    deal.stage = await getStage(deal);

    deal.assignedUsers = await getAssignedUsers(deal);

    return deal;
  },

  async fieldsForRentpay(
    _root,
    {
      contentType,
      searchable,
      code,
    }: {
      contentType: string;
      searchable: boolean;
      code: string;
    }
  ) {
    const query: any = { contentType };

    if (code) {
      const group = await sendCommonMessage({
        subdomain: "os",
        data: { code },
        action: "fieldsGroups.findOne",
        serviceName: "forms",
        defaultValue: null,
        isRPC: true,
      });

      if (!group) {
        throw new Error(`Group not found with ${code}`);
      }

      query.groupId = group._id;
    }

    if (searchable !== undefined) {
      query.searchable = searchable;
    }

    return sendCommonMessage({
      subdomain: "os",
      data: { query, sort: { order: 1 } },
      action: "fields.find",
      serviceName: "forms",
      defaultValue: [],
      isRPC: true,
    });
  },
};

export default queries;
