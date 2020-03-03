// import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const sendNotification = async (shape: IShapeDocument, data: any, result: object) => {
  const objectData = data.doc;

  const sendData = {
    kind: 'Notifications',
    params: {
      createdUser: '',
      receivers: [data.userId],
      title: shape.config.title,
      content: shape.config.content,
      notifType: shape.config.notifType,
      link: shape.config.link.concat(objectData._id),
      action: shape.config.action,
      contentType: shape.config.contentType,
      contentTypeId: objectData._id,
    },
  };

  await sendMessage('from_erkhet:to_erxes-list', sendData);

  return result;
};

export default sendNotification;
