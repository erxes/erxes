import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import {
  IProductTemplate,
  IProductTemplateDocument,
  productTemplateSchema
} from './definitions/productTemplates';
import { validSearchText } from '../../data/utils';
import Deals from './Deals';

export const fillSearchTextItem = (
  doc: IProductTemplate,
  item?: IProductTemplate
) => {
  const document = item || {
    title: '',
    description: '',
    discount: 0,
    totalAmount: 0
  };
  Object.assign(document, doc);

  return validSearchText([
    document.title || '',
    document.description || '',
    document.discount || 0,
    document.totalAmount || 0
  ]);
};

// set related templates
const setRelatedIds = async (template: IProductTemplateDocument) => {
  if (template.parentId) {
    const parentTemplate = await ProductTemplates.findOne({
      _id: template.parentId
    });

    if (parentTemplate) {
      let relatedIds: string[];

      relatedIds = template.relatedIds || [];
      relatedIds.push(template._id);

      relatedIds = _.union(relatedIds, parentTemplate.relatedIds || []);

      await ProductTemplates.updateOne(
        { _id: parentTemplate._id },
        { $set: { relatedIds } }
      );

      const updated = await ProductTemplates.findOne({
        _id: template.parentId
      });

      if (updated) {
        await setRelatedIds(updated);
      }
    }
  }
};

// remove related templates
const removeRelatedIds = async (template: IProductTemplateDocument) => {
  const _id = template ? template._id : '';

  const templates = await ProductTemplates.find({
    relatedIds: { $in: _id }
  });

  if (templates.length === 0) {
    return;
  }

  const relatedIds: string[] = template.relatedIds || [];

  relatedIds.push(_id);

  const doc: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: { relatedIds: string[] } };
    };
  }> = [];

  templates.forEach(async t => {
    const ids = (t.relatedIds || []).filter(id => !relatedIds.includes(id));

    doc.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } }
      }
    });
  });

  await ProductTemplates.bulkWrite(doc);
};

export interface IProductTemplateModel extends Model<IProductTemplateDocument> {
  getProductTemplate(selector: any): Promise<IProductTemplateDocument>;
  createProductTemplate(
    doc: IProductTemplate
  ): Promise<IProductTemplateDocument>;
  updateProductTemplate(
    _ids: string,
    doc: IProductTemplate
  ): Promise<IProductTemplateDocument>;
  checkUsedOnDeal(_ids: string[]): Promise<void>;
  checkDuplication(title: string): Promise<void>;
  removeProductTemplate(ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadProductTemplateClass = () => {
  class ProductTemplate {
    /**
     *
     * Get product template
     */
    public static async getProductTemplate(selector: any) {
      const productTemplate = await ProductTemplates.findOne(selector);

      if (!productTemplate) {
        throw new Error('Product template not found');
      }

      return productTemplate;
    }

    public static async checkDuplication(title: string) {
      const productTemplate = await ProductTemplates.findOne({ title });

      if (productTemplate) {
        throw new Error('Title must be unique');
      }
    }

    public static async checkUsedOnDeal(_ids: string[]) {
      const deal = await Deals.findOne({
        'productsData.templateId': { $in: _ids }
      });

      if (deal) {
        throw new Error(
          `You cannnot remove it, because it was used in ${deal.name}`
        );
      }
    }

    /*
     * Get a parent template
     */
    static async getParentTemplate(doc: IProductTemplate) {
      return ProductTemplates.findOne({
        _id: doc.parentId
      }).lean();
    }

    /**
     *
     * Create product template
     */
    public static async createProductTemplate(doc: IProductTemplate) {
      await this.checkDuplication(doc.title);

      const parentTemplate = await this.getParentTemplate(doc);
      // Generatingg order
      const order = await this.generateOrder(parentTemplate, doc);

      const productTemplate = await ProductTemplates.create({
        ...doc,
        order,
        searchText: fillSearchTextItem(doc)
      });

      await setRelatedIds(productTemplate);

      return productTemplate;
    }

    /**
     * Update Product Template
     */
    public static async updateProductTemplate(
      _id: string,
      doc: IProductTemplate
    ) {
      const searchText = fillSearchTextItem(
        doc,
        await ProductTemplate.getProductTemplate({ _id })
      );

      const parentTemplate = await this.getParentTemplate(doc);

      if (parentTemplate && parentTemplate.parentId === _id) {
        throw new Error('Cannot change template');
      }

      // Generatingg  order
      const order = await this.generateOrder(parentTemplate, doc);
      const template = await ProductTemplates.findOne({ _id });

      if (template && template.order) {
        await removeRelatedIds(template);
      }

      await ProductTemplates.updateOne(
        { _id },
        { $set: { ...doc, order, searchText } }
      );
      const updated = await ProductTemplates.findOne({ _id });

      if (updated) {
        await setRelatedIds(updated);
      }

      return updated;
    }

    /**
     * remove Product Template
     */
    public static async removeProductTemplate(_ids: string[]) {
      await this.checkUsedOnDeal(_ids);
      const childCount = await ProductTemplates.countDocuments({
        parentId: _ids
      });

      for (const _id of _ids) {
        const template = await ProductTemplates.getProductTemplate({ _id });
        await removeRelatedIds(template);
      }

      if (childCount > 0) {
        throw new Error('Please remove child templates first');
      }

      return ProductTemplates.deleteMany({ _id: { $in: _ids } });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentTemplate: IProductTemplateDocument,
      { title }: { title: string }
    ) {
      const order = `${title}`;

      if (!parentTemplate) {
        return order;
      }

      let parentOrder = parentTemplate.order;

      if (!parentOrder) {
        parentOrder = `${parentTemplate.title}`;

        await ProductTemplates.updateOne(
          {
            _id: parentTemplate._id
          },
          { $set: { order: parentOrder } }
        );
      }

      return `${parentOrder}/${order}`;
    }
  }

  productTemplateSchema.loadClass(ProductTemplate);

  return productTemplateSchema;
};

loadProductTemplateClass();

// tslint:disable-next-line
export const ProductTemplates = model<
  IProductTemplateDocument,
  IProductTemplateModel
>('product_templates', productTemplateSchema);
