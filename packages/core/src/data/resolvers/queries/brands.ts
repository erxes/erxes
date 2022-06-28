import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../../connectionResolver';
import { getDocumentList } from '../mutations/cacheUtils';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const queryBuilder = (params: IListArgs, brandIdSelector: any) => {
  const selector: any = { ...brandIdSelector };

  const { searchValue } = params;

  if (searchValue) {
    selector.name = new RegExp(`.*${params.searchValue}.*`, 'i');
  }

  return selector;
};

const brandQueries = {
  /**
   * All brands
   */
  allBrands(_root, {}, { brandIdSelector, models, subdomain }: IContext) {
    return getDocumentList(models, subdomain, 'brands', brandIdSelector);
  },

  /**
   * Brands list
   */
  brands(_root, args: IListArgs, { brandIdSelector, models }: IContext) {
    const selector = queryBuilder(args, brandIdSelector);

    return models.Brands.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one brand
   */
  brandDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Brands.findOne({ _id });
  },

  /**
   * Get all brands count. We will use it in pager
   */
  brandsTotalCount(_root, _args, { brandIdSelector, models }: IContext) {
    return models.Brands.find(brandIdSelector).countDocuments();
  },

  /**
   * Get last brand
   */
  brandsGetLast(_root, _args, { models }: IContext) {
    return models.Brands.findOne({}).sort({ createdAt: -1 });
  }
};

requireLogin(brandQueries, 'brandsTotalCount');
requireLogin(brandQueries, 'brandsGetLast');
requireLogin(brandQueries, 'brandDetail');

checkPermission(brandQueries, 'brands', 'showBrands', []);

export default brandQueries;
