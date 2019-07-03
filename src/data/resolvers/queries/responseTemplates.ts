import { ResponseTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

interface IListParams {
  page: number;
  perPage: number;
  brandId: string;
  searchValue: string;
}

const generateFilter = (args: IListParams) => {
  const { brandId, searchValue } = args;

  const filter: any = {};

  if (brandId) {
    filter.brandId = brandId;
  }

  if (searchValue) {
    filter.$or = [
      { name: new RegExp(`.*${searchValue || ''}.*`, 'i') },
      { content: new RegExp(`.*${searchValue || ''}.*`, 'i') },
    ];
  }

  return filter;
};

const responseTemplateQueries = {
  /**
   * Response templates list
   */
  responseTemplates(_root, args: IListParams) {
    const filter = generateFilter(args);

    return paginate(ResponseTemplates.find(filter), args);
  },

  /**
   * Get all response templates count. We will use it in pager
   */
  responseTemplatesTotalCount(_root, args: IListParams) {
    const filter = generateFilter(args);

    return ResponseTemplates.find(filter).countDocuments();
  },
};

requireLogin(responseTemplateQueries, 'responseTemplatesTotalCount');
checkPermission(responseTemplateQueries, 'responseTemplates', 'showResponseTemplates', []);

export default responseTemplateQueries;
