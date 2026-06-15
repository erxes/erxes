import { IProductDocument } from '@/posclient/@types/products';
import { IContext } from '@/posclient/@types/types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getRemBranchId } from '~/modules/posclient/utils/products';

const propertyToCustomFieldData = (field: string, value: any) => {
  const data: any = { field, value };

  if (typeof value === 'number') {
    data.numberValue = value;
  }

  if (typeof value === 'string') {
    data.stringValue = value;
  }

  if (value?.lat && value?.lng) {
    data.locationValue = {
      type: 'Point',
      coordinates: [value.lng, value.lat],
    };
    data.stringValue = `${value.lng},${value.lat}`;
  }

  return data;
};

const getCustomFieldsData = (product: IProductDocument) => {
  return Object.entries(product.propertiesData || {}).map(([field, value]) =>
    propertyToCustomFieldData(field, value),
  );
};

export default {
  customFieldsData(product: IProductDocument) {
    return getCustomFieldsData(product);
  },

  async customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext,
  ) {
    const customFieldsData = getCustomFieldsData(product);
    const fieldIds = customFieldsData.map((data) => data.field);

    const fields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'find',
      input: { query: { _id: { $in: fieldIds } }, projection: {}, sort: {} },
      defaultValue: [],
    });

    const fieldCodesById = {};

    for (const field of fields || []) {
      fieldCodesById[field._id] = field.code;
    }

    const results: any = {};

    for (const data of customFieldsData) {
      if (fieldCodesById[data.field]) {
        results[fieldCodesById[data.field]] = { ...data };
      }
    }

    return results;
  },

  unitPrice(product: IProductDocument, _args, { config }: IContext) {
    const mainPrice = product.prices?.[config.token] || 0;

    const ebarimtConfig = config.ebarimtConfig;
    if (!ebarimtConfig?.isCleanTaxPrice) {
      return mainPrice;
    }

    const vatPercent =
      (ebarimtConfig.hasVat && Number(ebarimtConfig.vatPercent)) || 0;
    const cityTaxPercent =
      (ebarimtConfig.hasCitytax && Number(ebarimtConfig.cityTaxPercent)) || 0;

    const taxRule = product.taxRules?.[config.token] || {};

    if (taxRule.taxType && ['2', '3', '5'].includes(taxRule.taxType)) {
      return mainPrice;
    }

    let totalPercent = vatPercent + cityTaxPercent + 100;

    const hasReverseCtaxRule =
      !!taxRule.citytaxCode &&
      !!ebarimtConfig.reverseCtaxRules?.includes(taxRule.citytaxCode);

    if (!ebarimtConfig.hasCitytax && hasReverseCtaxRule) {
      const pCtaxPercent = Number(taxRule.citytaxPercent) || 0;
      totalPercent = vatPercent + pCtaxPercent + 100;
    }

    return Number(((mainPrice / totalPercent) * 100).toFixed(2));
  },
  savedRemainder(product: IProductDocument, args, { config }: IContext) {
    const remBranchId = getRemBranchId(config, args.branchId);
    return product.remainderByToken?.[config.token]?.[remBranchId] || 0;
  },
  isCheckRem(product: IProductDocument, _args, { config }: IContext) {
    return product?.isCheckRems?.[config.token] || false;
  },

  hasSimilarity(product: IProductDocument & { hasSimilarity?: boolean }) {
    // legacy groupedSimilarity lists precompute this from the group size;
    // a field resolver overrides parent values, so pass theirs through
    if (typeof product.hasSimilarity === 'boolean') {
      return product.hasSimilarity;
    }

    return !!product.similarityId;
  },

  async category(product: IProductDocument, _, { models }: IContext) {
    return models.ProductCategories.findOne({ _id: product.categoryId });
  },
};
