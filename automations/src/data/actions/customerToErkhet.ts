import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const customerToErkhet = async (shape: IShapeDocument, data: any, result: object) => {
  const objectData = data.doc;
  let sendData = {};

  let name = objectData.primaryName || '';

  name =
    name && objectData.firstName
      ? name.concat(' - ').concat(objectData.firstName || '')
      : name || objectData.firstName || '';
  name =
    name && objectData.lastName
      ? name.concat(' - ').concat(objectData.lastName || '')
      : name || objectData.lastName || '';
  name = name ? name : shape.config.default_name;

  sendData = {
    action: data.action,
    oldCode: data.oldCode || '',
    object: {
      code: objectData.code || '',
      name,
      defaultCategory: shape.config.categoryCode,
      email: objectData.primaryEmail || '',
      phone: objectData.primaryPhone || '',
    },
  };

  const postData = {
    userEmail: shape.config.userEmail,
    token: shape.config.apiToken,
    apiKey: shape.config.apiKey,
    apiSecret: shape.config.apiSecret,
    orderInfos: JSON.stringify(sendData),
  };

  sendMessage('send_message:erxes-automation', {
    action: 'customer-change',
    data: postData,
  });

  return result;
};

export default customerToErkhet;
