import { sendRPCMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const productToErkhet = async (shape: IShapeDocument, data: any) => {
  const objectData = data.doc;
  let sendData = {};

  if (data.action.includes('Category')) {
    const productCategory = await sendRPCMessage('rpc_queue:erxes-automations', {
      action: 'get-or-error-product-category',
      payload: JSON.stringify({ _id: objectData.parentId }),
    });

    sendData = {
      action: data.action,
      oldCode: data.oldCode || '',
      object: {
        code: objectData.code || '',
        name: objectData.name || '',
        parentCode: productCategory ? productCategory.code : '',
      },
    };
  } else {
    const productCategory = await sendRPCMessage('rpc_queue:erxes-automations', {
      action: 'get-or-error-product-category',
      payload: JSON.stringify({ _id: objectData.categoryId }),
    });

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
        categoryCode: productCategory ? productCategory.code : '',
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

  return sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
    action: 'product-change',
    payload: JSON.stringify(postData),
  });
};

export default productToErkhet;
