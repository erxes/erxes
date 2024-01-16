import fetch from 'node-fetch';
import { sendCommonMessage } from '../messageBroker';

interface IParams {
  apiUrl: string;
  op: string;
  token: string;
  company: string;
  role: string;
  data?: any;
}

type CustomFieldType =
  | 'contacts:customer'
  | 'loans:contract'
  | 'savings.contract';

export const toPolaris = async (args: IParams) => {
  const { op, company, data, apiUrl, token, role } = args;
  const headers = {
    Op: op,
    Cookie: `NESSESSION=${token}`,
    Company: company,
    Role: role,
  };

  try {
    const requestOptions = {
      url: `${apiUrl}`,
      method: 'POST',
      headers,
      body: data,
    };

    return await fetch(apiUrl, requestOptions);
  } catch (e) {
    const errorMessage = JSON.parse(e.message).message || e.message;
    throw new Error(errorMessage);
  }
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return {
    apiUrl: 'http://202.131.242.158:4139/nesWeb/NesFront',
    company: '15',
    role: '45',
    token: 'MSk9sGO9h0bsPhTN4H7sa9phiJYylH',
  };
  return await sendCommonMessage({
    subdomain,
    action: 'getConfig',
    serviceName: 'core',
    data: { code, defaultValue },
    isRPC: true,
  });
};

export const getCustomer = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'customers.findOne',
    serviceName: 'contacts',
    data: { _id },
    isRPC: true,
  });
};

export const getBranch = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'branches.findOne',
    serviceName: 'core',
    data: { _id },
    isRPC: true,
  });
};

export const getLoanProduct = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contractType.findOne',
    serviceName: 'loans',
    data: { _id },
    isRPC: true,
  });
};

export const updateLoanNumber = async (subdomain, _id, number) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contracts.updateContractNumber',
    serviceName: 'loans',
    data: { _id, number },
    isRPC: true,
  });
};

export const getUser = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'users.findOne',
    serviceName: 'core',
    data: { _id },
    isRPC: true,
  });
};

export const getLoanContract = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'users.findOne',
    serviceName: 'core',
    data: { _id },
    isRPC: true,
  });
};

export const getCloseInfo = async (
  subdomain: string,
  contractId: string,
  closeDate: Date,
) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contractType.findOne',
    serviceName: 'loans',
    data: { contractId, closeDate },
    isRPC: true,
  });
};

export const getDepositAccount = async (
  subdomain: string,
  contractId: string,
) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contracts.getDepositAccount',
    serviceName: 'savings',
    data: { contractId },
    isRPC: true,
  });
};

export const customFieldToObject = async (
  subdomain,
  customFieldType: CustomFieldType,
  object,
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: 'forms',
    action: 'fields.find',
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: '' },
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const customFieldsData: any[] = object.customFieldsData || [];
  for (const f of fields) {
    const existingData = customFieldsData.find((c) => c.field === f._id);
    object[f.code] = existingData?.value;
  }

  return object;
};

export const objectToCustomField = async (
  subdomain,
  customFieldType,
  object,
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: 'forms',
    action: 'fields.find',
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: '' },
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const customFieldsData: any[] = object.customFieldsData || [];
  for (const f of fields) {
    const existingData = customFieldsData.find((c) => c.field === f._id);
    object[f.code] = existingData?.value;
  }
  return object;
};
