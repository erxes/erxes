import { generateModels } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { IRemainderDocument } from '../../../models/definitions/remainders';
import { ISafeRemainderItemDocument } from '../../../models/definitions/safeRemainderItems';
import { IUpdateRemaindersParams } from './remainders';

export const updateLiveRemainder = async ({
  subdomain,
  departmentId,
  branchId,
  productCategoryId,
  productIds
}: IUpdateRemaindersParams & { subdomain: string }) => {
  const models = await generateModels(subdomain);

  const selector: any = {};
  let allProductIds: string[] = [];

  selector.departmentId = departmentId;
  selector.branchId = branchId;

  if (productCategoryId) {
    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {},
        categoryId: productCategoryId
      },
      isRPC: true
    });

    const pIds = products.map(p => p._id);
    selector.productId = { $in: pIds };
    allProductIds = allProductIds.concat(pIds);
  }

  if (productIds) {
    selector.productId = { $in: productIds };
    allProductIds = allProductIds.concat(productIds);
  }

  const safeRemainders = await models.SafeRemainderItems.find(selector).lean();

  const remainders: IRemainderDocument[] = await models.Remainders.find(
    selector
  ).lean();

  const resultRemainder: IRemainderDocument[] = [];

  for (const productId of allProductIds) {
    let safe: ISafeRemainderItemDocument | undefined = undefined;
    const safed = safeRemainders.filter(
      (item: any) =>
        item.productId === productId &&
        item.departmentId === departmentId &&
        item.branchId === branchId
    );
    if (safed.length) {
      safe = safed[0];
    }

    const transactionSelector: any = {
      departmentId,
      branchId,
      productId: productId
    };

    if (safe && safe.lastTransactionDate) {
      transactionSelector.date = { $gt: safe.lastTransactionDate };
    }

    const trs = await models.TransactionItems.find(transactionSelector).lean();
    let remainderCount = safe ? safe.count : 0;

    for (const tr of trs) {
      remainderCount += tr.isDebit ? tr.count : -1 * tr.count;
    }

    const realRemainder = remainders.find(
      (item: any) =>
        item.productId === productId &&
        item.departmentId === departmentId &&
        item.branchId === branchId
    );

    if (realRemainder && realRemainder._id) {
      if (realRemainder.count === remainderCount) {
        resultRemainder.push(realRemainder);
      } else {
        models.Remainders.updateOne(
          { _id: realRemainder._id },
          { $set: { count: remainderCount } }
        );
        resultRemainder.push(
          await models.Remainders.getRemainderObject(realRemainder._id)
        );
      }
    } else {
      models.Remainders.create({
        productId,
        departmentId,
        branchId,
        count: remainderCount
        // uomId:
      });
    }
  }

  return resultRemainder;
};
