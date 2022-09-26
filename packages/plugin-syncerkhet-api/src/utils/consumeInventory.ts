import { sendProductsMessage } from '../messageBroker';
import { getConfig } from './utils';

export const consumeInventory = async (subdomain, doc, old_code, action) => {
  const product = await sendProductsMessage({
    subdomain,
    action: 'findOne',
    data: { code: old_code },
    isRPC: true
  });

  if ((action === 'update' && old_code) || action === 'create') {
    const productCategory = await sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: { code: doc.category_code },
      isRPC: true
    });

    const config = await getConfig(subdomain, 'ERKHET', {});

    const document = {
      name: doc.nickname || doc.name,
      type: doc.is_service ? 'service' : 'product',
      unitPrice: doc.unit_price,
      code: doc.code,
      productId: doc.id,
      sku: doc.measure_unit_code,
      categoryId: productCategory ? productCategory._id : product.categoryId,
      categoryCode: productCategory
        ? productCategory.code
        : product.categoryCode,
      description: eval('`' + config.consumeDescription + '`'),
      status: 'active'
    };

    if (product) {
      await sendProductsMessage({
        subdomain,
        action: 'updateProduct',
        data: { _id: product._id, doc: { ...document } },
        isRPC: true
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'createProduct',
        data: { doc: { ...document } },
        isRPC: true
      });
    }
  } else if (action === 'delete' && product) {
    await sendProductsMessage({
      subdomain,
      action: 'removeProducts',
      data: { _ids: [product._id] },
      isRPC: true
    });
  }
};

export const consumeInventoryCategory = async (
  subdomain,
  doc,
  old_code,
  action
) => {
  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { code: old_code },
    isRPC: true
  });

  if ((action === 'update' && old_code) || action === 'create') {
    const parentCategory = await sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: { code: doc.parent_code },
      isRPC: true
    });

    const document = {
      code: doc.code,
      name: doc.name,
      order: doc.order
    };

    if (productCategory) {
      await sendProductsMessage({
        subdomain,
        action: 'categories.updateProductCategory',
        data: {
          _id: productCategory._id,
          doc: {
            ...document,
            parentId: parentCategory
              ? parentCategory._id
              : productCategory.parentId
          }
        },
        isRPC: true
      });
    } else {
      await sendProductsMessage({
        subdomain,
        action: 'categories.createProductCategory',
        data: {
          doc: {
            ...document,
            parentId: parentCategory ? parentCategory._id : ''
          }
        },
        isRPC: true
      });
    }
  } else if (action === 'delete' && productCategory) {
    await sendProductsMessage({
      subdomain,
      action: 'categories.removeProductCategory',
      data: {
        _id: productCategory._id
      },
      isRPC: true
    });
  }
};
