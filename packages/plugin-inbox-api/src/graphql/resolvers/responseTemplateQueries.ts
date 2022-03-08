import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

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
    { commonQuerySelector, models }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return models.ResponseTemplates.find(filter);
  },

  /**
   * Get all response templates count. We will use it in pager
   */
  responseTemplatesTotalCount(
    _root,
    args: IListParams,
    { commonQuerySelector, models }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return models.ResponseTemplates.find(filter).countDocuments();
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