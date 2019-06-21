import { Brands } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions';
import { paginate } from '../../utils';

const brandQueries = {
  /**
   * Brands list
   */
  brands(_root, args: { page: number; perPage: number }) {
    const brands = paginate(Brands.find({}), args);
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
  brandsTotalCount() {
    return Brands.find({}).countDocuments();
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
