import { generateModels, IModels } from './connectionResolver';
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types';
import {
  IProductCategoryDocument,
  IProductDocument,
} from './db/models/definitions/products';

const modelChanger = (type: string, models: IModels) => {
  if (type === 'uoms') {
    return models.Uoms;
  }

  if (type === 'productCategories') {
    return models.ProductCategories;
  }

  if (type === 'productsConfigs') {
    return models.ProductsConfigs;
  }

  if (type === 'fields') {
    return models.Fields;
  }

  return models.Products;
};

const generateUniqueCode = (baseCode: string) => {
  return `${baseCode}-${stringRandomId.default()}`;
};

const generateOrder = (parentCategory: any, doc: any) => {
  const order = parentCategory
    ? `${parentCategory.order}${doc.code}/`
    : `${doc.code}/`;

  return order;
};

export default {
  types: [
    {
      description: 'Products',
      type: 'products',
    },
    {
      description: 'Forms',
      type: 'forms',
    },
  ],
  useTemplate: async ({ subdomain, data }) => {
    const { template, contentType, currentUser } = data;

    const { content, relatedContents } = template;

    const models = await generateModels(subdomain);

    let reDirect: string | undefined;

    switch (contentType) {
      case 'productCategories':
        reDirect = await productCategoryUseTemplate({
          models,
          content,
          relatedContents,
        });
        break;
      case 'forms':
        reDirect = await formUseTemplate({
          models,
          content,
          relatedContents,
          currentUser,
        });
        break;
    }

    return { reDirect };
  },
  getRelatedContent: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { contentType: currentType, content: stringifiedContent } = data;

    const [serviceName, contentType] = (currentType || '').split(':');

    const mainContent = JSON.parse(stringifiedContent);

    let relatedContents: any[] = [];

    if (serviceName === 'core') {
      switch (contentType) {
        case 'productCategories':
          relatedContents = await productRelatedContents({
            models,
            mainContent,
          });
          break;
        case 'forms':
          relatedContents = await formRelatedContents({ models, mainContent });
          break;
      }
    }
    return relatedContents;
  },
};

export const productRelatedContents = async ({ models, mainContent }) => {
  const { _id: productCategoryId } = mainContent;

  const relatedContents: any[] = [];

  const categories: IProductCategoryDocument[] =
    await models.ProductCategories.find(
      { parentId: productCategoryId },
      { scopeBrandIds: 0 }
    ).lean();

  let categoryIds = [productCategoryId];

  if (categories.length) {
    relatedContents.push({
      contentType: 'core:productCategories',
      content: categories.map(category => JSON.stringify(category)),
    });

    categoryIds = categories.map(c => c._id);
  }

  const products: IProductDocument[] = await models.Products.find(
    { categoryId: { $in: categoryIds }, status: 'active' },
    { tagIds: 0, scopeBrandIds: 0 }
  ).lean();

  if (products.length) {
    relatedContents.push({
      contentType: 'core:products',
      content: products.map(product => JSON.stringify(product)),
    });

    const uoms = new Set();

    products.map((product: IProductDocument) => {
      const { uom } = product;

      if (uom) {
        uoms.add(uom);
      }
    });

    const productUoms = await models.Uoms.find(
      { code: { $in: Array.from(uoms) } },
      { scopeBrandIds: 0 }
    ).lean();

    if (productUoms.length) {
      relatedContents.push({
        contentType: 'core:uoms',
        content: productUoms.map(uom => JSON.stringify(uom)),
      });
    }
  }

  return relatedContents;
};

export const formRelatedContents = async ({ models, mainContent }) => {
  const { _id: formId } = mainContent;

  const relatedContents: any[] = [];

  const fields = await models.Fields.find(
    { contentTypeId: formId, contentType: 'form', isDefinedByErxes: false },
    { _id: 0, scopeBrandIds: 0, lastUpdatedUserId: 0, productCategoryId: 0 }
  ).lean();

  if (fields.length) {
    relatedContents.push({
      contentType: 'core:fields',
      content: fields.map(field => JSON.stringify(field)),
    });
  }

  return relatedContents;
};

export const productCategoryUseTemplate = async ({
  models,
  content,
  relatedContents,
}) => {
  const { _id, code, parentId, ...productCategoryContent } =
    JSON.parse(content);

  const parentOrder = generateOrder(null, { code: generateUniqueCode(code) });

  const productCategory = await models.ProductCategories.create({
    ...productCategoryContent,
    code: generateUniqueCode(code),
    order: parentOrder,
    createdAt: new Date(),
  });

  if ((relatedContents || []).length) {
    const idMapping = {};

    for (const relatedContent of relatedContents) {
      const { contentType: currentType, content } = relatedContent;

      const [_, contentType] = currentType.split(':');

      const model: any = modelChanger(contentType, models);

      const parsedRelatedContents: any[] = [];

      for (const item of content) {
        const {
          _id,
          code,
          order,
          parentId,
          categoryId,
          scopeBrandIds,
          ...parsedContent
        } = JSON.parse(item);

        if (contentType === 'uoms') {
          const uom = await model.findOne({ code });

          if (uom) {
            continue;
          }
        }

        const newId = stringRandomId.default();

        idMapping[_id] = newId;

        const parsedRelatedContent: any = {
          ...parsedContent,
          _id: newId,
          code: generateUniqueCode(code),
          createdAt: new Date(),
        };

        if (contentType === 'productCategories') {
          parsedRelatedContent.parentId = productCategory._id;
          parsedRelatedContent.order = generateOrder(
            productCategory,
            parsedRelatedContent
          );
        }

        if (contentType === 'products') {
          parsedRelatedContent.categoryId =
            idMapping[categoryId] || productCategory._id;
        }

        parsedRelatedContents.push(parsedRelatedContent);
      }

      if (parsedRelatedContents.length > 0) {
        await model.insertMany(parsedRelatedContents);
      }
    }
  }

  return `/settings/product-service?categoryId=${productCategory._id || ''}`;
};

export const formUseTemplate = async ({
  models,
  content,
  relatedContents,
  currentUser,
}) => {
  const { _id, code, type, ...formContent } = JSON.parse(content);

  const form = await models.Forms.create({
    ...formContent,
    type,
    code: generateUniqueCode(code),
    createdUserId: currentUser._id,
    createdDate: new Date(),
  });

  if ((relatedContents || []).length) {
    const idMapping = {};

    for (const relatedContent of relatedContents) {
      const { contentType: currentType, content } = relatedContent;

      const [_, contentType] = currentType.split(':');

      const model: any = modelChanger(contentType, models);

      const parsedRelatedContents: any[] = [];

      for (const item of content) {
        const { _id, ...parsedContent } = JSON.parse(item);

        const newId = stringRandomId.default();

        idMapping[_id] = newId;

        const parsedRelatedContent: any = {
          ...parsedContent,
          _id: newId,
        };

        if (contentType === 'fields') {
          parsedRelatedContent.contentTypeId = form._id;
        }

        parsedRelatedContents.push(parsedRelatedContent);
      }

      if (parsedRelatedContents.length > 0) {
        await model.insertMany(parsedRelatedContents);
      }
    }
  }

  return `/forms/${type}s`;
};
