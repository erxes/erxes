import { ProductTemplates, Tags } from '../../../db/models';
import { PRODUCT_TEMPLATE_STATUSES } from '../../../db/models/definitions/constants';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { TAG_TYPES } from '../../../db/models/definitions/constants';
import { IContext } from '../../types';
import { escapeRegExp, paginate } from '../../utils';

interface IListParams {
  page: number;
  perPage: number;
  status: string;
  searchValue: string;
  tag: string;
  tagIds: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { status, tag, searchValue } = args;

  const filter: any = commonSelector;

  if (tag) {
    filter.tagIds = { $in: [tag] };
  }

  if (searchValue) {
    filter.$or = [
      { title: new RegExp(`.*${searchValue}.*`, 'i') },
      { description: new RegExp(`.*${searchValue}.*`, 'i') }
    ];
  }

  if (status) {
    filter.status = { $in: [new RegExp(`.*${escapeRegExp(status)}.*`, 'i')] };
  }

  return filter;
};

const productTemplateQueries = {
  /**
   * Product templates list
   */
  async productTemplates(
    _root,
    args: IListParams,
    { commonQuerySelector }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return paginate(
      ProductTemplates.find(filter)
        .sort('createdAt')
        .lean(),
      args
    );
  },

  /**
   * Get all product templates count.
   */
  productTemplateTotalCount(_root) {
    return ProductTemplates.find().countDocuments();
  },

  async productTemplateDetail(_root, { _id }: { _id: string }) {
    return ProductTemplates.findOne({ _id }).lean();
  },
  async productTemplateCountByTags() {
    const counts = {};

    // Count products by tag =========
    const tags = await Tags.find({ type: TAG_TYPES.PRODUCT_TEMPLATE }).lean();

    for (const tag of tags) {
      counts[tag._id] = await ProductTemplates.find({
        tagIds: tag._id,
        status: { $in: PRODUCT_TEMPLATE_STATUSES.ACTIVE }
      }).countDocuments();
    }

    return counts;
  }
};

requireLogin(productTemplateQueries, 'productTemplateTotalCount');
checkPermission(
  productTemplateQueries,
  'productTemplates',
  'showProductTemplates',
  []
);

export default productTemplateQueries;
