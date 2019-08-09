import { Brands } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const brandQueries = {
  /**
   * Brands list
   */
  brands(_root, args: { page: number; perPage: number }, { brandIdSelector }: IContext) {
    const brands = paginate(Brands.find(brandIdSelector), args);
    return brands.sort({ createdAt: -1 });
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
  },
};

requireLogin(brandQueries, 'brandsTotalCount');
requireLogin(brandQueries, 'brandsGetLast');
requireLogin(brandQueries, 'brandDetail');

checkPermission(brandQueries, 'brands', 'showBrands', []);

export default brandQueries;
