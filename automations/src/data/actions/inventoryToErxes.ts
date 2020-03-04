import { sendRPCMessage } from '../../messageBroker';

const inventoryToErxes = async (data: any) => {
  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;
  const kind = objectData.model;

  let productCategory = null;

  switch (kind) {
    case 'inventories.inventory':
      const product = await sendRPCMessage({
        action: 'get-or-error-product',
        payload: JSON.stringify({ code: data.old_code }),
      });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        productCategory = await sendRPCMessage({
          action: 'get-or-error-product-category',
          payload: JSON.stringify({ code: doc.category_code }),
        });

        const document = {
          name: doc.name,
          type: doc.is_service ? 'service' : 'product',
          unitPrice: doc.unit_price,
          code: doc.code,
          productId: doc.id,
          sku: doc.measure_unit_code,
        };

        if (product) {
          sendData = {
            kind: 'Products',
            method: 'updateProduct',
            params: [
              product._id,
              {
                ...document,
                categoryId: productCategory ? productCategory._id : product.categoryId,
                categoryCode: productCategory ? productCategory.code : product.categoryCode,
              },
            ],
          };
        } else {
          sendData = {
            kind: 'Products',
            method: 'createProduct',
            params: [
              {
                ...document,
                categoryId: productCategory ? productCategory._id : product.categoryId,
                categoryCode: productCategory ? productCategory.code : product.categoryCode,
              },
            ],
          };
        }
      } else if (data.action === 'delete' && product) {
        sendData = {
          kind: 'Products',
          method: 'removeProducts',
          params: [[product._id]],
        };
      }

      break;
    case 'inventories.category':
      productCategory = await sendRPCMessage({
        action: 'get-or-error-product-category',
        payload: JSON.stringify({ code: data.old_code }),
      });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        const parentCategory = await sendRPCMessage({
          action: 'get-or-error-product-category',
          payload: JSON.stringify({ code: doc.parent_code }),
        });

        const document = {
          code: doc.code,
          name: doc.name,
          order: doc.order,
        };

        if (productCategory) {
          sendData = {
            kind: 'ProductCategories',
            method: 'updateProductCategory',
            params: [
              productCategory._id,
              {
                ...document,
                parentId: parentCategory ? parentCategory._id : productCategory.parentId,
              },
            ],
          };
        } else {
          sendData = {
            kind: 'ProductCategories',
            method: 'createProductCategory',
            params: [
              {
                ...document,
                parentId: parentCategory ? parentCategory._id : undefined,
              },
            ],
          };
        }
      } else if (data.action === 'delete' && productCategory) {
        sendData = {
          kind: 'ProductCategories',
          method: 'removeProductCategory',
          params: [productCategory._id],
        };
      }
      break;
    default:
      sendData = {};
  }

  return sendRPCMessage({ action: 'method-from-kind', payload: JSON.stringify(sendData) });
};

export default inventoryToErxes;
