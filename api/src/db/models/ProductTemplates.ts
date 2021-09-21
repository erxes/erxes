import { Model, model } from 'mongoose';
import {
  IProductTemplate,
  IProductTemplateDocument
} from './definitions/productTemplates';

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
    }
  }
};
