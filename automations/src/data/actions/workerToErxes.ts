import { sendRPCMessage } from '../../messageBroker';
import { IShapeDocument } from '../../models/definitions/Automations';

const workerToErxes = async (shape: IShapeDocument, data: any) => {
  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;
  const kind = objectData.model;

  switch (kind) {
    case 'salary.worker':
      const teamMember = await sendRPCMessage({
        action: 'get-or-error-user',
        payload: JSON.stringify({ email: data.old_code }),
      });

      if ((data.action === 'update' && data.old_code) || data.action === 'create') {
        const document = {
          email: doc.email,
          username: doc.email,
          password: shape.config.pass.concat(doc.email),
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

  return sendRPCMessage({ action: 'method-from-kind', payload: JSON.stringify(sendData) });
};

export default workerToErxes;
