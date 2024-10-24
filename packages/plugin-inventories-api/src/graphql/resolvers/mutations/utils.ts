import * as _ from "lodash";
import { generateModels } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { IRemainderDocument } from "../../../models/definitions/remainders";
import { ISafeRemainderItemDocument } from "../../../models/definitions/safeRemainderItems";
import { IUpdateRemaindersParams } from "./remainders";

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
    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: {},
        categoryId: productCategoryId
      },
      isRPC: true
    });

    // Get product ids
    const productIds = products.map((item: any) => item._id);
    selector.productId = { $in: productIds };
    allProductIds = _.union(allProductIds, productIds);
  }

  if (productIds) {
    selector.productId = { $in: productIds };
    allProductIds = _.union(allProductIds, productIds);
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

    const transactionSelector: any = {
      departmentId,
      branchId,
      productId
    };

    const transactionItems =
      await models.TransactionItems.find(transactionSelector).lean();
    let remainderCount = safe ? safe.count : 0;

    for (const item of transactionItems) {
      remainderCount += item.isDebit ? item.count : -1 * item.count;
    }

    const realRemainder = remainders.find((item: any) => {
      if (
        item.productId === productId &&
        item.departmentId === departmentId &&
        item.branchId === branchId
      )
        return item;
    });

    if (realRemainder && realRemainder._id) {
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
    const product = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: { _id: productId },
      isRPC: true
    });
    products = [product];
  }

  if (productCategoryId) {
    products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: { status: { $nin: ["archived", "deleted"] } },
        categoryId: productCategoryId,
        sort: { code: 1 }
      },
      isRPC: true,
      defaultValue: []
    });
  }

  const productIds = products.map(p => p._id);

  return { products, productIds };
};
