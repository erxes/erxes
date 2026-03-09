import { TemplateManager } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { PipelineStage } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  PRODUCT_PIPELINE_STAGE,
  PRODUCT_UOM_STAGE,
  RODUCT_TEMPLATE_EXCLUDE_FIELDS,
} from './constants';

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
      const [{ descendants = [], products = [], uoms = [] } = {}] =
        await models.ProductCategories.aggregate(pipeline);

      const templateManager = new TemplateManager(RODUCT_TEMPLATE_EXCLUDE_FIELDS);

      return templateManager.getContent({
        productCategories: [parent, ...descendants],
        ...(products.length && { products }),
        ...(uoms.length && { uoms }),
      });
    } catch (error) {
      throw new Error(`Error occurred while generating content: ${error}`);
    }
  },

  setContent: async ({
    template,
    models,
    user,
  }: {
    template: any;
    models: IModels;
    user: IUserDocument;
  }) => {
    const { content } = template || {};

    if (!Object.keys(content).length) {
      throw new Error(`Template doesn't have any content`);
    }

    const templateManager = new TemplateManager();

    try {
      const orderMap: Record<string, string> = {};

      const { categories = [], products = [], uoms = [] } = templateManager.setContent(content);

      for (const category of categories) {
        const parentId = String(category.parentId || '');
        const parentOrder = orderMap[parentId] || '';
        const newOrder = `${parentOrder}${category.code}/`;

        orderMap[String(category._id)] = newOrder;

        category.order = newOrder;
      }

      await models.ProductCategories.insertMany(categories);

      for (const uom of uoms) {
        const exists = await models.Uoms.findOne({ code: uom.code });

        if (!exists) {
          await models.Uoms.create(uom);
        }
      }

      if (products.length) {
        await models.Products.insertMany(products);
      }

      return '/settings/products/categories';
    } catch (error) {
      throw new Error(`Error occurred while installing template: ${error}`);
    }
  },
};
