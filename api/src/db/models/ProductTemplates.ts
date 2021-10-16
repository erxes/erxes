import { Model, model } from 'mongoose';
import {
  IProductTemplate,
  IProductTemplateDocument,
  productTemplateSchema
} from './definitions/productTemplates';
import { validSearchText } from '../../data/utils';

export const fillSearchTextItem = (
  doc: IProductTemplate,
  item?: IProductTemplate
) => {
  const document = item || { title: '', description: '', discount: 0 , totalAmount: 0 };
  Object.assign(document, doc);

  return validSearchText([document.title || '', document.description || '' , document.discount || 0 , document.totalAmount || 0 ]);
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

    static async checkDuplication(title: string) {
      const productTemplate = await ProductTemplates.findOne({ title });

      if (productTemplate) {
        throw new Error('Title must be unique');
      }
    }
    /**
     *
     * Create product template
     */
    public static async createProductTemplate(doc: IProductTemplate) {
      await this.checkDuplication(doc.title);      

      const productTemplate = await ProductTemplates.create({
        ...doc,        
        searchText: fillSearchTextItem(doc)
      });

      return productTemplate;

    }

       /**
     * Update Product Template
     */
    public static async updateProductTemplate(_id: string, doc: IProductTemplate) {
      const searchText = fillSearchTextItem(doc, await ProductTemplate.getProductTemplate({_id}));
    
      await ProductTemplates.updateOne({ _id }, { $set: doc, searchText });    
      return ProductTemplates.findOne({ _id });
    }

    /**
     * remove Product Template
     */
     public static async removeProductTemplate(_ids: string[]) {      
      return ProductTemplates.deleteMany({ _id: { $in: _ids } });
    }
  }

  productTemplateSchema.loadClass(ProductTemplate);

  return productTemplateSchema;
};

loadProductTemplateClass();

// tslint:disable-next-line
export const ProductTemplates = model<IProductTemplateDocument,IProductTemplateModel>('product_templates', productTemplateSchema);
