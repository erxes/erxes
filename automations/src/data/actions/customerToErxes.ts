import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const customerToErxes = async (shape: IShapeDocument, data: any, result: object) => {
  // tslint:disable-next-line: no-unused-expression
  shape;

  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;

  const { API_MONGO_URL = '' } = process.env;
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  const apiMongoClient = await mongoose.createConnection(API_MONGO_URL, options);
  const apiCustomers = apiMongoClient.db.collection('customers');

  const customer = await apiCustomers.findOne({ code: data.old_code });

  if ((data.action === 'update' && data.old_code) || data.action === 'create') {
    const document = {
      firstName: doc.name,
      code: doc.code,
      primaryEmail: doc.mail,
      primaryPhone: doc.phone,
      emails: [doc.mail],
      phones: [doc.phone],
    };

    if (customer) {
      sendData = {
        kind: 'Customers',
        method: 'updateCustomer',
        params: [
          customer._id,
          {
            ...document,
          },
        ],
      };
    } else {
      sendData = {
        kind: 'Customers',
        method: 'createCustomer',
        params: [
          {
            ...document,
          },
        ],
      };
    }
  } else if (data.action === 'delete' && customer) {
    sendData = {
      kind: 'Customers',
      method: 'removeCustomers',
      params: [[customer._id]],
    };
  }

  await sendMessage('from_erkhet:to_erxes-list', sendData);

  return result;
};

export default customerToErxes;
