import {
  IProductCondition,
  ProductConditionCodesMode,
} from '@/products/@types/condition';
import { IContext } from '~/connectionResolvers';

export const productConditionMutations = {
  async productConditionsAdd(
    _root: undefined,
    doc: IProductCondition,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditions.createCondition(doc);
  },

  async productConditionsEdit(
    _root: undefined,
    { _id, ...doc }: IProductCondition & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditions.updateCondition(_id, doc);
  },

  async productConditionsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditions.removeConditions(_ids);
  },

  // Returns how many products were touched.
  async productCategorySetConditionCodes(
    _root: undefined,
    {
      categoryId,
      codes,
      mode,
    }: { categoryId: string; codes: string[]; mode: ProductConditionCodesMode },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductConditions.setCategoryConditionCodes(
      categoryId,
      codes,
      mode,
    );
  },

  // Returns how many products were touched; deleted ones are left alone.
  async productsSetConditionCodes(
    _root: undefined,
    {
      productIds,
      codes,
      mode,
    }: { productIds: string[]; codes: string[]; mode: ProductConditionCodesMode },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductConditions.setProductsConditionCodes(
      productIds,
      codes,
      mode,
    );
  },
};
