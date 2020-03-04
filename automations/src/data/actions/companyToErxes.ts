import { sendRPCMessage } from '../../messageBroker';

const companyToErxes = async (data: any) => {
  let sendData = {};
  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;

  const company = await sendRPCMessage({
    action: 'get-or-error-company',
    payload: JSON.stringify({ code: data.old_code }),
  });

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

  return sendRPCMessage({ action: 'method-from-kind', payload: JSON.stringify(sendData) });
};

export default companyToErxes;
