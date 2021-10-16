import { ProductTemplates, Tags } from '../../../db/models';
import {
  PRODUCT_TEMPLATE_STATUSES
} from '../../../db/models/definitions/constants';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import {  
  TAG_TYPES
} from '../../../db/models/definitions/constants';
import { IContext } from '../../types';
import { escapeRegExp, paginate } from '../../utils';

const productTemplateQueries = {
  /**
   * Product templates list
   */
  async productTemplates(
    _root,
    {      
      searchValue,
      tag,     
      status,       
      ...pagintationArgs
    }: {
      ids: string[];              
      searchValue: string;
      tag: string;
      status: string;
      page: number;
      perPage: number;
    },
    { commonQuerySelector }: IContext  
  ) {

    const filter: any = commonQuerySelector;

    if (tag) {
      filter.tagIds = { $in: [tag] };    
    }

    if( status )
    filter.status = { $in: [new RegExp(`.*${escapeRegExp(status)}.*`, 'i')] };    

    // search =========
    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
    }
    
    console.log(filter);

    return paginate(
      ProductTemplates.find(filter)
        .sort('createdAt')
        .lean(),
      pagintationArgs
    );
  },

  /**
   * Get all product templates count.
   */
   productTemplateTotalCount(
    _root    
  ) {
    // const filter = {status : { $in: PRODUCT_TEMPLATE_STATUSES.ACTIVE } };    
    return ProductTemplates.find().countDocuments();
  },  

  productTemplateDetail(_root, { _id }: { _id: string }) {
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
checkPermission(productTemplateQueries, 'productTemplates', 'showProductTemplates', []);

export default productTemplateQueries;
