import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const productToErkhet = async (shape: IShapeDocument, data: any, result: object) => {
  const objectData = data.doc;
  let sendData = {};

  const { API_MONGO_URL = '' } = process.env;
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  const apiMongoClient = await mongoose.createConnection(API_MONGO_URL, options);

  if (data.action.includes('productCategory')) {
    const apiProductCategories = apiMongoClient.db.collection('product_categories');
    const productCategories = await apiProductCategories.find({ _id: objectData.parentId }).toArray();

    sendData = {
      action: data.action,
      oldCode: data.oldCode || '',
      object: {
        code: objectData.code || '',
        name: objectData.name || '',
        parentCode: productCategories ? productCategories[0].code : '',
      },
    };
  } else {
    const apiProductCategories = apiMongoClient.db.collection('product_categories');
    const productCategories = await apiProductCategories.find({ _id: objectData.categoryId }).toArray();

    sendData = {
      action: data.action,
      oldCode: data.oldCode || '',
      object: {
        code: objectData.code || '',
        name: objectData.name || '',
        measureUnit: objectData.sku || '',
        unitPrice: objectData.unitPrice || 0,
        costAccount: shape.config.costAccount,
        saleAccount: shape.config.saleAccount,
        categoryCode: productCategories ? productCategories[0].code : '',
        defaultCategory: shape.config.categoryCode,
      },
    };
  }

  const postData = {
    userEmail: shape.config.userEmail,
    token: shape.config.apiToken,
    apiKey: shape.config.apiKey,
    apiSecret: shape.config.apiSecret,
    orderInfos: JSON.stringify(sendData),
  };

  sendMessage('send_message:erxes-automation', {
    action: 'product-change',
    data: postData,
  });

  return result;
};

export default productToErkhet;
