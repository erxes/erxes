import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const inventoryToErxes = async (shape: IShapeDocument, data: any, result: object) => {
  // tslint:disable-next-line: no-unused-expression
  shape;

  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;
  const kind = objectData.model;

  const { API_MONGO_URL = '' } = process.env;
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  const apiMongoClient = await mongoose.createConnection(API_MONGO_URL, options);
  const apiProductCategories = apiMongoClient.db.collection('product_categories');
  const apiProducts = apiMongoClient.db.collection('products');
  let productCategory = null;

  switch (kind) {
    case 'inventories.inventory':
      const product = await apiProducts.findOne({ code: data.old_code });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        productCategory = await apiProductCategories.findOne({ code: doc.category_code });

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
      productCategory = await apiProductCategories.findOne({ code: data.old_code });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        const parentCategory = await apiProductCategories.findOne({ code: doc.parent_code });

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

  await sendMessage('from_erkhet:to_erxes-list', sendData);

  return result;
};

export default inventoryToErxes;
