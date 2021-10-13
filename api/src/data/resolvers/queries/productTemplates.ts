import { ProductTemplates } from '../../../db/models';
import {
  PRODUCT_TEMPLATE_STATUSES
} from '../../../db/models/definitions/constants';
import { checkPermission, requireLogin } from '../../permissions/wrappers';

const productTemplateQueries = {
  /**
   * Product templates list
   */
  async productTemplates(
    _root
  ) {
    const filter = {status : { $in: PRODUCT_TEMPLATE_STATUSES.ACTIVE } };
    
    return ProductTemplates.find(filter)
  },

  /**
   * Get all product templates count.
   */
   productTemplateTotalCount(
    _root    
  ) {
    const filter = {status : { $in: PRODUCT_TEMPLATE_STATUSES.ACTIVE } };    
    return ProductTemplates.find(filter).countDocuments();
  },  

  productTemplateDetail(_root, { _id }: { _id: string }) {
    return ProductTemplates.findOne({ _id }).lean();
  }  
};

requireLogin(productTemplateQueries, 'productTemplateTotalCount');
checkPermission(productTemplateQueries, 'productTemplates', 'showProductTemplates', []);

export default productTemplateQueries;
