import fetch from 'node-fetch';
import { sendCommonMessage } from '../messageBroker';

interface IParams {
  op: string;
  subdomain: string;
  data?: any;
}

type CustomFieldType =
  | 'contacts:customer'
  | 'loans:contract'
  | 'savings:contract';

export const fetchPolaris = async (args: IParams) => {
  const { op, data, subdomain } = args;

  const config = await getConfig(subdomain, 'POLARIS', {});

  const headers = {
    Op: op,
    Cookie: `NESSESSION=${config.token}`,
    Company: config.companyCode,
    Role: config.role,
    'Content-Type': 'application/json',
  };

  try {
    const requestOptions = {
      url: `${config.apiUrl}`,
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    };

    return await fetch(config.apiUrl, requestOptions)
      .then(async (response) => {
        if (!response.ok) {
          let responseText = await response.text();
          throw new Error(responseText);
        }
        return response.text();
      })
      .then((response) => {
        return response;
      });
  } catch (e) {
    throw new Error(e.message);
  }
};

export const getConfig = async (subdomain, code, defaultValue?) => {
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

export const setCustomerCode = async (subdomain, _id, code) => {
  return await sendCommonMessage({
    subdomain,
    action: 'customers.updateOne',
    serviceName: 'contacts',
    data: {
      selector: { _id },
      modifier: { $set: { code } },
    },
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

export const updateSavingNumber = async (subdomain, _id, number) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contracts.updateContractNumber',
    serviceName: 'savings',
    data: { _id, number },
    isRPC: true,
  });
};

export const getUser = async (subdomain, id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'users.findOne',
    serviceName: 'core',
    data: { _id: id },
    isRPC: true,
  });
};

export const getLoanContract = async (subdomain, id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contract.findOne',
    serviceName: 'loans',
    data: { _id: id },
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
  customerId: string,
) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contracts.getDepositAccount',
    serviceName: 'savings',
    data: { customerId },
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

export const getSavingProduct = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contractType.findOne',
    serviceName: 'savings',
    data: { _id },
    isRPC: true,
  });
};

export const getSavingContract = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contract.findOne',
    serviceName: 'savings',
    data: { _id },
    isRPC: true,
  });
};

export const getBoolean = (value) => {
  if (value === 1) return true;
  return false;
};

export const getBooleanToNumber = (value) => {
  if (value === true) return 1;
  return 0;
};

export const getClassificationCode = (classificationCode) => {
  switch (classificationCode) {
    case 'NORMAL':
      return '1';
    case 'EXPIRED':
      return '2';
    case 'DOUBTFUL':
      return '3';
    case 'NEGATIVE':
      return '4';
    case 'BAD':
      return '5';

    default:
      return '1';
  }
};

export const getLoanContractAccount = (contractType, loanContract) => {
  switch (loanContract.classification) {
    case 'NORMAL':
      return contractType.config.normalAccount;
    case 'EXPIRED':
      return contractType.config.expiredAccount;
    case 'DOUBTFUL':
      return contractType.config.doubtfulAccount;
    case 'NEGATIVE':
      return contractType.config.negativeAccount;
    case 'BAD':
      return contractType.config.badAccount;

    default:
      break;
  }
};

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = ndate.getTimezoneOffset() * 1000 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  return today;
};
