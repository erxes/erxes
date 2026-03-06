import { TemplateManager } from 'erxes-api-shared/core-modules';
import { IProductCategoryDocument, IUserDocument } from 'erxes-api-shared/core-types';
import { PipelineStage } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { PRODUCT_CATEGORY_TEMPLATE_OMIT_FIELDS, PRODUCT_PIPELINE_STAGE, PRODUCT_UOM_STAGE } from './constants';

export default {
  moduleName: 'product',
  collectionName: 'productCategory',

  label: 'Product Category',
  description: 'Product Category Template',
  icon: 'IconCategory',

  getContent: async ({
    template,
    models,
  }: {
    template: any;
    models: IModels;
  }) => {
    const { contentId, configs } = template || {};

    if (!contentId) {
      throw new Error('Content ID missing');
    }

    const parent = await models.ProductCategories.findOne({ _id: contentId }, '-parentId -order').lean();

    if (!parent) {
      throw new Error('Document not found');
    }

    const pipeline: PipelineStage[] = [
      {
        $match: { _id: parent._id },
      },
      {
        $graphLookup: {
          from: 'product_categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
        },
      },
    ];

    const { collections = ['products', 'uoms'] } = configs || {};

    if (collections.includes('products')) {
      pipeline.push(PRODUCT_PIPELINE_STAGE);
    }

    if (collections.includes('products') && collections.includes('uoms')) {
      pipeline.push(PRODUCT_UOM_STAGE);
    }
    
    try {
      const [{ descendants = [], products = [], uoms = [] } = {}] = await models.ProductCategories.aggregate(pipeline);

      const templateManager = new TemplateManager<IProductCategoryDocument>(PRODUCT_CATEGORY_TEMPLATE_OMIT_FIELDS);

      return templateManager.getContent([...[parent, ...descendants].map(doc => ({ ...doc, _collection: 'product_categories' })), ...uoms.map(doc => ({ ...doc, _collection: 'uoms' })), ...products.map(doc => ({ ...doc, _collection: 'products' }))]);
    } catch (error) {
      throw new Error(`Error occurred while generating content: ${error}`)
    }
  },

  setContent: async ({
    template,
    models,
    user
  }: {
    template: any;
    models: IModels;
    user: IUserDocument
  }) => {
    const { content } = template || {};

    if (!Object.keys(content).length) {
      throw new Error(`Template doesn't have any content`)
    }

    const categoryManager = new TemplateManager<IProductCategoryDocument>(
      PRODUCT_CATEGORY_TEMPLATE_OMIT_FIELDS
    )

    try {
      const orderMap: Record<string, string> = {}

      const documents = categoryManager.setContent(content)

      const categories = documents.filter((d: any) => d._collection === 'product_categories')
      const products  = documents.filter((d: any) => d._collection === 'products')
      const uoms      = documents.filter((d: any) => d._collection === 'uoms')

      for (const category of categories) {
        const parentId = String(category.parentId || '')
        const parentOrder = orderMap[parentId] || ''
        const newOrder = `${parentOrder}${category.code}/`

        orderMap[String(category._id)] = newOrder

        category.order = newOrder
      }

      await models.ProductCategories.insertMany(categories);

      for (const uom of uoms) {
        const exists = await models.Uoms.findOne({ code: uom.code })

        if (!exists) await models.Uoms.create({ ...uom, _collection: undefined })
      }

      if (products.length) {
        await models.Products.insertMany(products)
      }

      return '/settings/products/categories'
    } catch (error) {
      throw new Error(`Error occurred while installing template: ${error}`)
    }
  },
};
