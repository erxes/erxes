import { getConfig } from 'erxes-api-utils'
import { toErkhet } from './utils'

export const productCategoryToErkhet = async (models, messageBroker, memoryStorage, params, action) => {
  const productCategory = params.updatedDocument || params.object
  const oldProductCategory = params.object;
  const parentProductCategory = await models.ProductCategories.findOne({ _id: productCategory.parentId })

  const config = await getConfig(models, memoryStorage, 'ERKHET', {});

  const sendData = {
    action,
    oldCode: oldProductCategory.code || '',
    object: {
      code: productCategory.code || '',
      name: productCategory.name || '',
      parentCode: parentProductCategory ? parentProductCategory.code : '',
    },
  };

  toErkhet(messageBroker, config, sendData, 'product-change')
}

export const productToErkhet = async (models, messageBroker, memoryStorage, params, action) => {
  const product = params.updatedDocument || params.object
  const oldProduct = params.object;
  const productCategory = await models.ProductCategories.findOne({ _id: product.categoryId })

  const config = await getConfig(models, memoryStorage, 'ERKHET', {});

  const sendData = {
    action,
    oldCode: oldProduct.code || '',
    object: {
      code: product.code || '',
      name: product.name || '',
      measureUnit: product.sku || 'ш',
      unitPrice: product.unitPrice || 0,
      costAccount: config.costAccount,
      saleAccount: config.saleAccount,
      categoryCode: productCategory ? productCategory.code : '',
      defaultCategory: config.productCategoryCode,
    },
  };

  toErkhet(messageBroker, config, sendData, 'product-change')
}