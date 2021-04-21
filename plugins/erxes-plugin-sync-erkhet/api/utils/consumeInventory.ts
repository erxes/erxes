import { getConfig } from 'erxes-api-utils'

export const consumeInventory = async (models, memoryStorage, doc, old_code, action) => {
  const product = await models.Products.findOne({ code: old_code });

  if ((action === 'update' && old_code) || action === 'create') {
    const productCategory = await models.ProductCategories.findOne({ code: doc.category_code });

    const config = await getConfig(models, memoryStorage, 'ERKHET', {});

    const document = {
      name: doc.nickname || doc.name,
      type: doc.is_service ? 'service' : 'product',
      unitPrice: doc.unit_price,
      code: doc.code,
      productId: doc.id,
      sku: doc.measure_unit_code,
      categoryId: productCategory ? productCategory._id : product.categoryId,
      categoryCode: productCategory ? productCategory.code : product.categoryCode,
      description: eval("`" + config.consumeDescription + "`"),
    };

    if (product) {
      await models.Products.updateProduct(product._id, { ...document });
    } else {
      await models.Products.createProduct({ ...document });
    }
  } else if (action === 'delete' && product) {
    await models.Products.removeProducts([product._id]);
  }
}

export const consumeInventoryCategory = async (models, doc, old_code, action) => {
  const productCategory = await models.ProductCategories.findOne({ code: old_code })

  if ((action === 'update' && old_code) || action === 'create') {
    const parentCategory = await models.ProductCategories.findOne({ code: doc.parent_code })

    const document = {
      code: doc.code,
      name: doc.name,
      order: doc.order,
    };

    if (productCategory) {
      models.ProductCategories.updateProductCategory(
        productCategory._id,
        { ...document, parentId: parentCategory ? parentCategory._id : productCategory.parentId }
      )
    } else {
      models.ProductCategories.createProductCategory({
        ...document,
        parentId: parentCategory ? parentCategory._id : undefined,
      })
    }
  } else if (action === 'delete' && productCategory) {
    models.ProductCategories.removeProductCategory(productCategory._id)
  }
}