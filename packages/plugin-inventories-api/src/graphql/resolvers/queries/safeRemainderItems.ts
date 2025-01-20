import { paginate } from "@erxes/api-utils/src/core";
import {
  checkPermission
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";

export const generateFilterItems = async (subdomain: string, params: any) => {
  const { remainderId, productCategoryIds, status, diffType } = params;
  const query: any = { remainderId };

  if (productCategoryIds && productCategoryIds.length) {
    const categories = await sendCoreMessage({
      subdomain,
      action: "categories.withChilds",
      data: { ids: productCategoryIds },
      isRPC: true
    });

    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: { categoryId: { $in: categories.map(c => c._id) } },
      },
      isRPC: true,
      defaultValue: []
    });

    const productIds = products.map(p => p._id);
    query.productId = { $in: productIds };
  }

  if (status) {
    query.status = status;
  }

  if (diffType) {
    const diffTypes = diffType.split(",");
    let op;
    if (diffTypes.includes("gt")) {
      op = ">";
    }
    if (diffTypes.includes("lt")) {
      op = "<";
    }
    if (op) {
      if (diffTypes.includes("eq")) {
        op = `${op}=`;
      }
    } else {
      if (diffTypes.includes("eq")) {
        op = `===`;
      }
    }
    query.$where = `this.preCount ${op} this.count`;
  }

  return query;
};

const safeRemainderItemsQueries = {
  safeRemainderItems: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return paginate(
      models.SafeRemainderItems.find(query).sort({ order: 1 }).lean(),
      params
    );
  },

  safeRemainderItemsCount: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return models.SafeRemainderItems.find(query).countDocuments();
  }
};

checkPermission(safeRemainderItemsQueries, "safeRemainderItems", "manageRemainders", []);
checkPermission(safeRemainderItemsQueries, "safeRemainderItemsCount", "manageRemainders", []);

export default safeRemainderItemsQueries;
