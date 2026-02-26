import * as lodash from "lodash";
import { generateModels } from "~/connectionResolvers";
import { IRemainderDocument } from "~/modules/inventories/@types/remainders";
import { ISafeRemainderItemDocument } from "~/modules/inventories/@types/safeRemainderItems";
import { IUpdateRemaindersParams } from "./remainders";
import { sendTRPCMessage } from "erxes-api-shared/utils";

export const updateLiveRemainders = async ({
  subdomain,
  departmentId,
  branchId,
  productCategoryId,
  productIds
}: IUpdateRemaindersParams & { subdomain: string }) => {
  const models = await generateModels(subdomain);

  const selector: any = {};
  let allProductIds: string[] = [];

  if (departmentId) selector.departmentId = departmentId;
  if (branchId) selector.branchId = branchId;

  if (productCategoryId) {
    // Find all products in category by categoryId
    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: "find",
      input: {
        query: {},
        categoryId: productCategoryId
      },
    });

    // Get product ids
    const productIds = products.map((item: any) => item._id);
    selector.productId = { $in: productIds };
    allProductIds = lodash.union(allProductIds, productIds);
  }

  if (productIds) {
    selector.productId = { $in: productIds };
    allProductIds = lodash.union(allProductIds, productIds);
  }

  const safeRemainders: any =
    await models.SafeRemainderItems.find(selector).lean();
  const remainders: any = await models.Remainders.find(selector).lean();
  const resultRemainder: IRemainderDocument[] = [];

  for (const productId of allProductIds) {
    let safe: ISafeRemainderItemDocument | undefined = undefined;
    safe = safeRemainders.find((item: any) => {
      if (
        item.productId === productId &&
        item.departmentId === departmentId &&
        item.branchId === branchId
      )
        return item;
    });

    let remainderCount = safe ? safe.count : 0;

    const realRemainder = remainders.find((item: any) => {
      if (
        item.productId === productId &&
        item.departmentId === departmentId &&
        item.branchId === branchId
      )
        return item;
    });

    if (realRemainder?._id) {
      if (realRemainder.count === remainderCount) {
        resultRemainder.push(realRemainder);
      } else {
        await models.Remainders.updateRemainder(realRemainder._id, {
          count: remainderCount
        });

        resultRemainder.push(
          await models.Remainders.getRemainder(realRemainder._id)
        );
      }
    } else {
      models.Remainders.create({
        productId,
        departmentId,
        branchId,
        count: remainderCount
      });
    }
  }

  return resultRemainder;
};

export const getProducts = async (subdomain, productId, productCategoryId) => {
  let products: any[] = [];
  if (productId) {
    const product = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: "find",
      input: { _id: productId },
    });
    products = [product];
  }

  if (productCategoryId) {
    products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: "products.find",
      input: {
        query: { status: { $nin: ["archived", "deleted"] } },
        categoryId: productCategoryId,
        sort: { code: 1 }
      },
      defaultValue: []
    });
  }

  const productIds = products.map(p => p._id);

  return { products, productIds };
};
