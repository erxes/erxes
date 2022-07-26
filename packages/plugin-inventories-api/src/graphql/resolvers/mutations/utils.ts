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

  const safeRems = await models.SafeRemainderItems.find(selector).lean();

  const remainders: IRemainderDocument[] = await models.Remainders.find(
    selector
  ).lean();

  const resultRems: IRemainderDocument[] = [];
  for (const prodId of allProductIds) {
    let safe: ISafeRemainderItemDocument | undefined = undefined;
    const safed = safeRems.filter(
      s =>
        s.productId === prodId &&
        s.departmentId === departmentId &&
        s.branchId === branchId
    );
    if (safed.length) {
      safe = safed[0];
    }

    const trSelector: any = {
      departmentId,
      branchId,
      productId: prodId
    };

    if (safe && safe.lastTrDate) {
      trSelector.date = { $gt: safe.lastTrDate };
    }

    const trs = await models.TransactionItems.find(trSelector).lean();
    let remCount = safe ? safe.count : 0;

    for (const tr of trs) {
      remCount += tr.isDebit ? tr.count : -1 * tr.count;
    }

    const realRem = remainders.find(
      s =>
        s.productId === prodId &&
        s.departmentId === departmentId &&
        s.branchId === branchId
    );
    if (realRem && realRem._id) {
      if (realRem.count === remCount) {
        resultRems.push(realRem);
      } else {
        models.Remainders.updateOne(
          { _id: realRem._id },
          { $set: { count: remCount } }
        );
        resultRems.push(
          await models.Remainders.getRemainderObject(realRem._id)
        );
      }
    } else {
      models.Remainders.create({
        productId: prodId,
        departmentId,
        branchId,
        count: remCount
        // quantity:
        // uomId:
      });
    }
  }

  return resultRems;
};
