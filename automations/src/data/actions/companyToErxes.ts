import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const companyToErxes = async (shape: IShapeDocument, data: any, result: object) => {
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
  const apiCompanies = apiMongoClient.db.collection('companies');

  const company = await apiCompanies.findOne({ code: data.old_code });

  if ((data.action === 'update' && data.old_code) || data.action === 'create') {
    const document = {
      primaryName: doc.name,
      code: doc.code,
      names: [doc.name],
    };

    if (company) {
      sendData = {
        kind: 'Companies',
        method: 'updateCompany',
        params: [
          company._id,
          {
            ...document,
          },
        ],
      };
    } else {
      sendData = {
        kind: 'Companies',
        method: 'createCompany',
        params: [
          {
            ...document,
          },
        ],
      };
    }
  } else if (data.action === 'delete' && company) {
    sendData = {
      kind: 'Companies',
      method: 'removeCompanies',
      params: [[company._id]],
    };
  }

  await sendMessage('from_erkhet:to_erxes-list', sendData);

  return result;
};

export default companyToErxes;
