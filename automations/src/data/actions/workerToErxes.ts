import * as mongoose from 'mongoose';
import { sendMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const workerToErxes = async (shape: IShapeDocument, data: any, result: object) => {
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
  const apiTeamMembers = apiMongoClient.db.collection('users');

  switch (kind) {
    case 'salary.worker':
      const teamMember = await apiTeamMembers.findOne({ email: data.old_code });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        const document = {
          email: data.email,
          username: data.email,
          details: {
            fullName: doc.first_name.concat(' ').concat(doc.last_name),
            position: doc.position,
          },
        };

        if (teamMember) {
          sendData = {
            kind: 'Users',
            method: 'editProfile',
            params: [teamMember._id, { ...document }],
          };
        } else {
          sendData = {
            kind: 'Users',
            method: 'createUser',
            params: [{ ...document }],
          };
        }
      } else if (data.action === 'delete' && teamMember) {
        sendData = {
          kind: 'Users',
          method: 'setUserActiveOrInactive',
          params: [[teamMember._id]],
        };
      }

      break;

    default:
      sendData = {};
  }

  await sendMessage('from_erkhet:to_erxes-list', sendData);

  return result;
};

export default workerToErxes;
