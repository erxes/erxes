import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { ISafeRemItemDocument } from '../../../models/definitions/safeRemainders';
import { IRemainderDocument } from '../../../models/definitions/remainders';

interface IUpdateRemaindersParams {
  productCategoryId?: string;
  productIds?: string[];
  departmentId: string;
  branchId: string;
}

const remainderMutations = {
  async updateRemainders(
    _root,
    params: IUpdateRemaindersParams,
    { models, subdomain, user }: IContext
  ) {
    const { productCategoryId, productIds, departmentId, branchId } = params;
    const selector: any = {};
    let allProductIds: string[] = [];

    if (departmentId) {
      selector.departmentId = departmentId;
    }

    if (branchId) {
      selector.branchId = branchId;
    }

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

    const safeRems = await models.SafeRemItems.find(selector).lean();

    const remainders: IRemainderDocument[] = await models.Remainders.find(
      selector
    ).lean();

    const resultRems: IRemainderDocument[] = [];
    for (const prodId of allProductIds) {
      let safe: ISafeRemItemDocument | undefined = undefined;
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

      const trs = await models.TrItems.find(trSelector).lean();
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
  }
};

checkPermission(remainderMutations, 'updateRemainders', 'manageRemainders');

export default remainderMutations;
