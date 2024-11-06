import { generateModels, IModels } from "./connectionResolver";
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'
import { IProductCategoryDocument, IProductDocument } from "./db/models/definitions/products";

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

  return models.Products;
};

const generateUniqueCode = (baseCode: string) => {
  return `${baseCode}-${stringRandomId.default()}`;
};

const generateOrder = (
  parentCategory: any,
  doc: any,
) => {
  const order = parentCategory
    ? `${parentCategory.order}${doc.code}/`
    : `${doc.code}/`;

  return order;
}

export default {
  types: [
    {
      description: "Products",
      type: "products"
    }
  ],
  useTemplate: async ({ subdomain, data }) => {

    const { template, currentUser } = data

    const { content, relatedContents } = template

    const models = await generateModels(subdomain)

    const { _id, code, parentId, ...productCategoryContent } = JSON.parse(content)

    const parentOrder = generateOrder(null, { code: generateUniqueCode(code) })

    const productCategory = await models.ProductCategories.create({
      ...productCategoryContent,
      code: generateUniqueCode(code),
      order: parentOrder,
      createdAt: new Date(),
    })

    if ((relatedContents || []).length) {
      const idMapping = {};

      for (const relatedContent of relatedContents) {

        const { contentType: type, content } = relatedContent;

        const [_, contentType] = type.split(':');

        const model: any = modelChanger(contentType, models);

        const parsedRelatedContents: any[] = [];

        for (const item of content) {
          const { _id, code, order, parentId, categoryId, scopeBrandIds, ...parsedContent } = JSON.parse(item);

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
            parsedRelatedContent.order = generateOrder(productCategory, parsedRelatedContent)
          }

          if (contentType === 'products') {
            parsedRelatedContent.categoryId = idMapping[categoryId] || productCategory._id
          }

          parsedRelatedContents.push(parsedRelatedContent);
        }

        if (parsedRelatedContents.length > 0) {
          await model.insertMany(parsedRelatedContents);
        }
      }
    }

    const reDirect = `/settings/product-service?categoryId=${productCategory._id || ''}`

    return { reDirect };
  },
  getRelatedContent: async ({ subdomain, data }) => {

    const models = await generateModels(subdomain)

    const { contentType: type, content: stringifiedContent } = data

    const [serviceName, _] = (type || '').split(':')

    const mainContent = JSON.parse(stringifiedContent)

    const relatedContents: any[] = []

    if (serviceName === 'core') {
      const { _id: productCategoryId } = mainContent

      const categories: IProductCategoryDocument[] = await models.ProductCategories.find({ parentId: productCategoryId }, { scopeBrandIds: 0 }).lean()

      let categoryIds = [productCategoryId]

      if (categories.length) {
        relatedContents.push({
          contentType: "core:productCategories",
          content: categories.map(category => JSON.stringify(category))
        })

        categoryIds = categories.map((c) => c._id)
      }

      const products: IProductDocument[] = await models.Products.find({ categoryId: { $in: categoryIds }, status: "active" }, { tagIds: 0, scopeBrandIds: 0 }).lean()

      if (products.length) {

        relatedContents.push({
          contentType: "core:products",
          content: products.map(product => JSON.stringify(product))
        })

        const uoms = new Set()

        products.map((product: IProductDocument) => {
          const { uom } = product

          if (uom) {
            uoms.add(uom)
          }
        })

        const productUoms = await models.Uoms.find({ code: { $in: Array.from(uoms) } }, { scopeBrandIds: 0 }).lean()

        if (productUoms.length) {
          relatedContents.push({
            contentType: "core:uoms",
            content: productUoms.map(uom => JSON.stringify(uom))
          })
        }
      }
    }
    return relatedContents
  }
};

