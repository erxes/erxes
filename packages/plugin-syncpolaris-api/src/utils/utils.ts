import { sendRequest } from '@erxes/api-utils/src';
import { sendCommonMessage } from '../messageBroker';

interface IParams {
  apiUrl: string;
  op: string;
  token: string;
  company: string;
  role: string;
  data?: any;
}

export const toPolaris = async (args: IParams) => {
  const { op, company, data, apiUrl, token, role } = args;
  const headers = {
    Op: op,
    Cookie: `NESSESSION=${token}`,
    Company: company,
    Role: role
  };

  try {
    const requestOptions = {
      url: `${apiUrl}`,
      method: 'POST',
      headers,
      body: data
    };

    return await sendRequest(requestOptions);
  } catch (e) {
    const errorMessage = JSON.parse(e.message).message || e.message;
    throw new Error(errorMessage);
  }
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCommonMessage({
    subdomain,
    action: 'getConfig',
    serviceName: 'core',
    data: { code, defaultValue },
    isRPC: true
  });
};
