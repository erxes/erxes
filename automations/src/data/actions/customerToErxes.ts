import { sendRPCMessage } from '../../messageBroker';

const customerToErxes = async (data: any) => {
  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;

  const customer = await sendRPCMessage('rpc_queue:erxes-automations', {
    action: 'get-or-error-customer',
    payload: JSON.stringify({ code: data.old_code }),
  });

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

  return sendRPCMessage('rpc_queue:erxes-automations', {
    action: 'method-from-kind',
    payload: JSON.stringify(sendData),
  });
};

export default customerToErxes;
