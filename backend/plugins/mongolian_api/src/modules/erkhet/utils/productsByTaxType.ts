import * as lodash from 'lodash';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'productCategories',
    action: 'withChilds',
    input: { _ids: categoryIds },
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(catIds));
};

const getChildTags = async (subdomain: string, tagIds: string[]) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'findWithChild',
    input: { query: { _id: { $in: tagIds } }, fields: { _id: 1 } },
    defaultValue: [],
  });

  const foundTagIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(foundTagIds));
};

const checkProductsByRule = async (subdomain, products, rule) => {
  let filterIds: string[] = [];
  const productIds = products.map((p) => p._id);

  if (rule.productCategoryIds?.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      rule.productCategoryIds,
    );

    const includeProductIdsCat = products
      .filter((p) => includeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.concat(
      lodash.intersection(includeProductIdsCat, productIds),
    );
  }

  if (rule.tagIds?.length) {
    const includeTagIds = await getChildTags(subdomain, rule.tagIds);

    const includeProductIdsTag = products
      .filter((p) => lodash.intersection(includeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.concat(
      lodash.intersection(includeProductIdsTag, productIds),
    );
  }

  if (rule.productIds?.length) {
    filterIds = filterIds.concat(
      lodash.intersection(rule.productIds, productIds),
    );
  }

  if (!filterIds.length) {
    return [];
  }

  // found special products
  const filterProducts = products.filter((p) => filterIds.includes(p._id));

  const excludeCategoryIds = rule.excludeCatIds || rule.excludeCategoryIds;

  if (excludeCategoryIds?.length) {
    const excludeCatIds = await getChildCategories(
      subdomain,
      excludeCategoryIds,
    );

    const excProductIdsCat = filterProducts
      .filter((p) => excludeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsCat.includes(f));
  }

  if (rule.excludeTagIds?.length) {
    const excludeTagIds = await getChildTags(subdomain, rule.excludeTagIds);

    const excProductIdsTag = filterProducts
      .filter((p) => lodash.intersection(excludeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsTag.includes(f));
  }

  if (rule.excludeProductIds?.length) {
    filterIds = filterIds.filter((f) => !rule.excludeProductIds.includes(f));
  }

  return filterIds;
};

export const calcProductsTaxRule = async (
  subdomain: string,
  models: any,
  config: any,
  products: any[],
) => {
  let oneMoreVat = false;
  let oneMoreCtax = false;

  const vatRules =
    (config?.reverseVatRules?.length &&
      (await models.ProductRules.find({
        _id: { $in: config.reverseVatRules },
      }).lean())) ||
    [];

  const ctaxRules =
    (config?.reverseCtaxRules?.length &&
      (await models.ProductRules.find({
        _id: { $in: config.reverseCtaxRules },
      }).lean())) ||
    [];

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = { ...product, taxRule: {} };
  }

  if (vatRules.length) {
    for (const rule of vatRules) {
      const productIdsByRule = await checkProductsByRule(
        subdomain,
        products,
        rule,
      );
      for (const pId of productIdsByRule) {
        oneMoreVat = true;
        productsById[pId].taxRule.taxCode = rule.taxCode;
        productsById[pId].taxRule.taxType = rule.taxType;
      }
    }
  }

  if (ctaxRules.length) {
    for (const rule of ctaxRules) {
      const productIdsByRule = await checkProductsByRule(
        subdomain,
        products,
        rule,
      );
      for (const pId of productIdsByRule) {
        oneMoreCtax = true;
        productsById[pId].taxRule.citytaxCode = rule.taxCode;
        productsById[pId].taxRule.citytaxPercent = rule.taxPercent;
      }
    }
  }

  return { productsById, oneMoreCtax, oneMoreVat };
};
