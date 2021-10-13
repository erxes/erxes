import {  ProductTemplates } from '../../../db/models';
import { PRODUCT_TEMPLATE_STATUSES } from '../../../db/models/definitions/constants';
import {
  IProductTemplateDocument,  
  IProductTemplate
} from '../../../db/models/definitions/productTemplates';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IProductTemplatesEdit extends IProductTemplate {
  _id: string;
}

const productTemplateMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productTemplatesAdd(_root, doc: IProductTemplate, { user, docModifier }: IContext) {    
    doc.status = PRODUCT_TEMPLATE_STATUSES.ACTIVE;
    doc.createdBy = user._id;

    console.log("doc");  
    console.log(doc);

    const productTemplate = await ProductTemplates.createProductTemplate(docModifier(doc));    

    await putCreateLog(
      {
        type: MODULE_NAMES.PRODUCT_TEMPLATE,
        newData: {
          ...doc
        },
        object: productTemplate
      },
      user
    );

    return productTemplate;
  },

  /**
   * Edits a product
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async productTemplatesEdit(
    _root,
    { _id, ...doc }: IProductTemplatesEdit,
    { user }: IContext
  ) {
    const productTemplate = await ProductTemplates.getProductTemplate({ _id });
    const updated = await ProductTemplates.updateProductTemplate(_id, doc);

    await putUpdateLog(
      { 
        type: MODULE_NAMES.PRODUCT_TEMPLATE, 
        object: productTemplate,
        newData: { ...doc },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productTemplatesRemove(
    _root,
    { productTemplateIds }: { productTemplateIds: string[] },
    { user }: IContext
  ) {
    const productTemplates: IProductTemplateDocument[] = await ProductTemplates.find({
      _id: { $in: productTemplateIds }
    }).lean();

    const response = await ProductTemplates.removeProductTemplate(productTemplateIds);

    for (const productTemplate of productTemplates) {
      await putDeleteLog({ type: MODULE_NAMES.PRODUCT, object: productTemplate }, user);
    }

    return response;
  }
};

moduleCheckPermission(productTemplateMutations, 'manageProductTemplates');

export default productTemplateMutations;
