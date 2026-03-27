import { IProductDocument } from '@/posclient/@types/products';
import { IContext } from '@/posclient/@types/types';
import { getRemBranchId } from '~/modules/posclient/utils/products';

export default {
  async customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext,
  ) {
    // return customFieldsDataByFieldCode(product, subdomain);
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

    if (
      !ebarimtConfig.hasCitytax &&
      ebarimtConfig.reverseCtaxRules?.length &&
      taxRule.citytaxCode
    ) {
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

  async category(product: IProductDocument, _, { models }: IContext) {
    return models.ProductCategories.findOne({ _id: product.categoryId });
  },
};
