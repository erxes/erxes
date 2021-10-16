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
   * Creates a new productTemplate
   * @param {Object} doc ProductTemplate document
   */
  async productTemplatesAdd(_root, doc: IProductTemplate, { user, docModifier }: IContext) {    
    doc.status = PRODUCT_TEMPLATE_STATUSES.ACTIVE;
    doc.createdBy = user._id;

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
   * Edits a productTemplate
   * @param {string} param2._id ProductTemplate id
   * @param {Object} param2.doc ProductTemplate info
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
   * Changes a status
   * @param {string} param2._id ProductTemplate id
   * @param {string} param2.status ProductTemplate status
   */
   async productTemplatesChangeStatus(
    _root,
    { _id, status }: IProductTemplatesEdit,
    { user }: IContext
  ) {
    const productTemplate = await ProductTemplates.getProductTemplate({ _id });
    
    await ProductTemplates.updateOne({ _id }, { $set: { status } });    
    const updated = await ProductTemplates.findOne({ _id });

    await putUpdateLog(
      { 
        type: MODULE_NAMES.PRODUCT_TEMPLATE, 
        object: productTemplate,
        newData: { status },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },
  /**
   * Copies a productTemplate
   * @param {string} param2._id ProductTemplate id   
   */
   async productTemplatesDuplicate(
    _root,    
    { _id }: IProductTemplatesEdit,
    {user, docModifier }: IContext
  ) {
    const productTemplate = await ProductTemplates.getProductTemplate({ _id : _id });        
    const doc = {} as IProductTemplate;
    const {title, description, discount, totalAmount, type, templateItems, tagIds, status } = productTemplate;

    doc.title = title + " copied";
    doc.description = description;
    doc.discount = discount;
    doc.totalAmount = totalAmount;
    doc.type = type;
    doc.templateItems = templateItems;
    doc.tagIds = tagIds;
    doc.status = status;
    doc.createdBy = user._id;

    const newProductTemplate = await ProductTemplates.create(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.PRODUCT_TEMPLATE,
        newData: {
          doc
        },
        object: newProductTemplate
      },
      user
    );

    return newProductTemplate;
  },
  /**
   * Removes a productTemplate
   * @param {string} param1._id ProductTemplate id
   */
  async productTemplatesRemove(
    _root,
    { ids }: { ids: string[] },
    { user }: IContext
  ) {
    const productTemplates: IProductTemplateDocument[] = await ProductTemplates.find({
      _id: { $in: ids }
    }).lean();

    const response = await ProductTemplates.removeProductTemplate(ids);

    for (const productTemplate of productTemplates) {
      await putDeleteLog({ type: MODULE_NAMES.PRODUCT, object: productTemplate }, user);
    }

    return response;
  }
};

moduleCheckPermission(productTemplateMutations, 'manageProductTemplates');

export default productTemplateMutations;
