import { fixNum, isEnabled, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

type PaymentConfig = {
  type?: string;
  config?: string;
};

type TaxRuleResult = {
  productIdsByVatRule: Set<string>;
  productIdsByCtaxRule: Set<string>;
  ctaxRuleByProductId: Record<string, any>;
};

const asArray = (value: string | string[] | undefined) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const getChildCategories = async (subdomain: string, categoryIds: string[]) => {
  if (!categoryIds?.length) {
    return [];
  }

  const categories = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'productCategories',
    action: 'withChilds',
    input: { _ids: categoryIds },
    defaultValue: [],
  });

  const categoryIdsFromTree: string[] = (categories || []).map(
    (cat: any) => cat._id,
  );

  return Array.from(new Set(categoryIdsFromTree));
};

const getChildTags = async (subdomain: string, tagIds: string[]) => {
  if (!tagIds?.length) {
    return [];
  }

  const tags = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'findWithChild',
    input: { query: { _id: { $in: tagIds } }, fields: { _id: 1 } },
    defaultValue: [],
  });

  const tagIdsFromTree: string[] = (tags || []).map((tag: any) => tag._id);

  return Array.from(new Set(tagIdsFromTree));
};

const intersects = (left: string[] = [], right: string[] = []) => {
  const rightSet = new Set(right);
  return left.some((item) => rightSet.has(item));
};

const checkProductsByRule = async (
  subdomain: string,
  products: any[],
  rule: any,
) => {
  let filterIds: string[] = [];
  const productIds = products.map((product) => product._id);

  if (rule.productCategoryIds?.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      rule.productCategoryIds,
    );

    const includeProductIdsCat = products
      .filter((product) => includeCatIds.includes(product.categoryId))
      .map((product) => product._id);

    filterIds = filterIds.concat(
      includeProductIdsCat.filter((productId) =>
        productIds.includes(productId),
      ),
    );
  }

  if (rule.tagIds?.length) {
    const includeTagIds = await getChildTags(subdomain, rule.tagIds);

    const includeProductIdsTag = products
      .filter((product) => intersects(includeTagIds, product.tagIds || []))
      .map((product) => product._id);

    filterIds = filterIds.concat(
      includeProductIdsTag.filter((productId) =>
        productIds.includes(productId),
      ),
    );
  }

  if (rule.productIds?.length) {
    filterIds = filterIds.concat(
      rule.productIds.filter((productId) => productIds.includes(productId)),
    );
  }

  filterIds = Array.from(new Set(filterIds));
  if (!filterIds.length) {
    return [];
  }

  const filteredProducts = products.filter((product) =>
    filterIds.includes(product._id),
  );

  const excludeCategoryIds = rule.excludeCatIds || rule.excludeCategoryIds;

  if (excludeCategoryIds?.length) {
    const excludeCatIds = await getChildCategories(
      subdomain,
      excludeCategoryIds,
    );

    const excludeProductIdsCat = filteredProducts
      .filter((product) => excludeCatIds.includes(product.categoryId))
      .map((product) => product._id);

    filterIds = filterIds.filter(
      (productId) => !excludeProductIdsCat.includes(productId),
    );
  }

  if (rule.excludeTagIds?.length) {
    const excludeTagIds = await getChildTags(subdomain, rule.excludeTagIds);

    const excludeProductIdsTag = filteredProducts
      .filter((product) => intersects(excludeTagIds, product.tagIds || []))
      .map((product) => product._id);

    filterIds = filterIds.filter(
      (productId) => !excludeProductIdsTag.includes(productId),
    );
  }

  if (rule.excludeProductIds?.length) {
    filterIds = filterIds.filter(
      (productId) => !rule.excludeProductIds.includes(productId),
    );
  }

  return filterIds;
};

const getProductRules = async (
  subdomain: string,
  ruleIds: string | string[] = [],
) => {
  if (!(await isEnabled('mongolian'))) {
    return [];
  }

  const ids = asArray(ruleIds).filter(Boolean);

  if (!ids.length) {
    return [];
  }

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'mongolian',
    method: 'query',
    module: 'productRules',
    action: 'find',
    input: { data: { _id: { $in: ids } } },
    defaultValue: [],
  });
};

export const calcAccountingProductsTaxRule = async (
  subdomain: string,
  config: any,
  products: any[],
): Promise<TaxRuleResult> => {
  const productIdsByVatRule = new Set<string>();
  const productIdsByCtaxRule = new Set<string>();
  const ctaxRuleByProductId: Record<string, any> = {};

  const [vatRules, ctaxRules] = await Promise.all([
    getProductRules(subdomain, config?.reverseVatRules || []),
    getProductRules(subdomain, config?.reverseCtaxRules || []),
  ]);

  for (const rule of vatRules || []) {
    const productIdsByRule = await checkProductsByRule(
      subdomain,
      products,
      rule,
    );

    for (const productId of productIdsByRule) {
      productIdsByVatRule.add(productId);
    }
  }

  for (const rule of ctaxRules || []) {
    const productIdsByRule = await checkProductsByRule(
      subdomain,
      products,
      rule,
    );

    for (const productId of productIdsByRule) {
      productIdsByCtaxRule.add(productId);
      ctaxRuleByProductId[productId] = rule;
    }
  }

  return { productIdsByVatRule, productIdsByCtaxRule, ctaxRuleByProductId };
};

export const ensureCtaxRowByProductRule = async (
  models: IModels,
  rule: any,
) => {
  if (!rule) {
    return;
  }

  const percent = Number(rule.taxPercent || 0);
  const number = rule.taxCode || `reverse-ctax-${percent}`;

  const existingRow = await models.CtaxRows.findOne({
    number,
    percent,
    kind: 'normal',
    status: 'active',
  }).lean();

  if (existingRow) {
    return existingRow;
  }

  return await models.CtaxRows.createCtaxRow({
    name: rule.title || `Reverse city tax ${percent}%`,
    number,
    kind: 'normal',
    formula: '',
    formulaText: '',
    status: 'active',
    percent,
  });
};

export const getProductsByIds = async (
  subdomain: string,
  productIds: string[],
) => {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (!ids.length) {
    return [];
  }

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: { query: { _id: { $in: ids } }, limit: ids.length },
    defaultValue: [],
  });
};

export const getDealPaymentTypes = async (subdomain: string, deal: any) => {
  const pipeline = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pipeline',
    action: 'findOne',
    input: {
      stageId: deal.stageId,
      query: deal.pipelineId ? { _id: deal.pipelineId } : undefined,
      fields: { paymentTypes: 1 },
    },
    defaultValue: {},
  });

  return pipeline?.paymentTypes || [];
};

export const getOrderPaymentTypes = async (subdomain: string, order: any) => {
  const pos = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pos',
    action: 'configs.findOne',
    input: order.posId ? { _id: order.posId } : { token: order.posToken },
    defaultValue: {},
  });

  return pos?.paymentTypes || [];
};

export const getPreTaxPaymentTypes = (paymentTypes: PaymentConfig[] = []) =>
  (paymentTypes || [])
    .filter(
      (payment) =>
        (payment.config || '').includes('preTax: true') ||
        (payment.config || '').includes('"preTax": true'),
    )
    .map((payment) => payment.type)
    .filter(Boolean) as string[];

export const calcDealPreTaxPercent = (
  paymentTypes: PaymentConfig[],
  deal: any,
) => {
  const preTaxPaymentTypes = getPreTaxPaymentTypes(paymentTypes);
  let itemAmountPrePercent = 0;

  if (
    preTaxPaymentTypes.length &&
    deal.paymentsData &&
    Object.keys(deal.paymentsData).length
  ) {
    let preTaxAmount = 0;

    for (const paymentType of preTaxPaymentTypes) {
      preTaxAmount += Number(deal.paymentsData[paymentType]?.amount || 0);
    }

    const totalPaymentAmount = (Object.values(deal.paymentsData) as any[])
      .map((payment) => Number(payment.amount || 0))
      .reduce((sum, amount) => sum + amount, 0);

    if (preTaxAmount && preTaxAmount <= totalPaymentAmount) {
      itemAmountPrePercent = (preTaxAmount / totalPaymentAmount) * 100;
    }
  }

  return { itemAmountPrePercent, preTaxPaymentTypes };
};

export const calcOrderPreTaxPercent = (
  paymentTypes: PaymentConfig[],
  order: any,
) => {
  const preTaxPaymentTypes = getPreTaxPaymentTypes(paymentTypes);
  let itemAmountPrePercent = 0;

  if (preTaxPaymentTypes.length && order.paidAmounts?.length) {
    let preTaxAmount = 0;

    for (const paymentType of preTaxPaymentTypes) {
      for (const paidAmount of order.paidAmounts || []) {
        if (paidAmount.type === paymentType) {
          preTaxAmount += Number(paidAmount.amount || 0);
        }
      }
    }

    if (preTaxAmount && preTaxAmount <= order.totalAmount) {
      itemAmountPrePercent = (preTaxAmount / order.totalAmount) * 100;
    }
  }

  return { itemAmountPrePercent, preTaxPaymentTypes };
};

export const subtractPreTaxAmount = (amount: number, preTaxPercent: number) => {
  const minusAmount = (amount / 100) * preTaxPercent;
  return fixNum(amount - minusAmount, 8);
};
