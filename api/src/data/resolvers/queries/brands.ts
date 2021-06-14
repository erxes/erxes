import { Brands } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
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
  allBrands(_root, {}, { brandIdSelector }: IContext) {
    return getDocumentList('brands', brandIdSelector);
  },

  /**
   * Brands list
   */
  brands(_root, args: IListArgs, { brandIdSelector }: IContext) {
    const selector = queryBuilder(args, brandIdSelector);

    return Brands.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one brand
   */
  brandDetail(_root, { _id }: { _id: string }) {
    return Brands.findOne({ _id });
  },

  /**
   * Get all brands count. We will use it in pager
   */
  brandsTotalCount(_root, _args, { brandIdSelector }: IContext) {
    return Brands.find(brandIdSelector).countDocuments();
  },

  /**
   * Get last brand
   */
  brandsGetLast() {
    return Brands.findOne({}).sort({ createdAt: -1 });
  }
};

requireLogin(brandQueries, 'brandsTotalCount');
requireLogin(brandQueries, 'brandsGetLast');
requireLogin(brandQueries, 'brandDetail');

checkPermission(brandQueries, 'brands', 'showBrands', []);

export default brandQueries;
