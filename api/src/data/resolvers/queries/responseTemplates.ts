import { ResponseTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

interface IListParams {
  page: number;
  perPage: number;
  brandId: string;
  searchValue: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { brandId, searchValue } = args;

  const filter: any = commonSelector;

  if (brandId) {
    filter.brandId = brandId;
  }

  if (searchValue) {
    filter.$or = [
      { name: new RegExp(`.*${searchValue}.*`, 'i') },
      { content: new RegExp(`.*${searchValue}.*`, 'i') }
    ];
  }

  return filter;
};

const responseTemplateQueries = {
  /**
   * Response templates list
   */
  responseTemplates(
    _root,
    args: IListParams,
    { commonQuerySelector }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return paginate(ResponseTemplates.find(filter), args);
  },

  /**
   * Get all response templates count. We will use it in pager
   */
  responseTemplatesTotalCount(
    _root,
    args: IListParams,
    { commonQuerySelector }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return ResponseTemplates.find(filter).countDocuments();
  }
};

requireLogin(responseTemplateQueries, 'responseTemplatesTotalCount');
checkPermission(
  responseTemplateQueries,
  'responseTemplates',
  'showResponseTemplates',
  []
);

export default responseTemplateQueries;
