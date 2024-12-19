import fetch from 'node-fetch';
import * as http from 'http';
import * as https from 'https';
import { IModels, generateModels } from '../connectionResolver';
import { sendCommonMessage } from '../messageBroker';
import { ISyncLogDocument } from '../models/definitions/syncLog';

interface IParams {
  op: string;
  subdomain: string;
  polarisConfig: any;
  models?: IModels;
  syncLog?: ISyncLogDocument;
  data?: any;
  skipLog?: boolean;
}

type CustomFieldType = "core:customer" | "loans:contract" | "savings:contract";

export const fetchPolaris = async (args: IParams) => {
  const { op, data, subdomain, polarisConfig, skipLog } = args;
  let models = args.models;
  let syncLog = args.syncLog;

  const config = polarisConfig;

  const headers = {
    Op: op,
    Cookie: `NESSESSION=${config.token}`,
    Company: config.companyCode,
    Role: config.role,
    "Content-Type": "application/json"
  };

  if (!skipLog) {
    if (models && syncLog) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        {
          $set: {
            sendData: data,
            sendStr: JSON.stringify(data || {}),
            header: JSON.stringify(headers)
          }
        }
      );
    } else {
      models = await generateModels(subdomain);
      const syncLogDoc = {
        type: '',
        contentType: op,
        contentId: '',
        createdAt: new Date(),
        createdBy: '',
        consumeData: {},
        consumeStr: '',
        sendData: data,
        sendStr: JSON.stringify(data || {}),
        header: JSON.stringify(headers)
      };
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
    }
  }

  try {
    const requestOptions = {
      url: `${config.apiUrl}`,
      method: "POST",
      headers,
      body: JSON.stringify(data),
      agent:
        config.apiUrl.includes("http://") &&
        new http.Agent({ keepAlive: true }) ||
        new https.Agent({ keepAlive: true, rejectUnauthorized: false })
    };

    const realResponse = await fetch(config.apiUrl, requestOptions)
      .then(async (response) => {
        if (!response.ok) {
          const respErr = await response.text();
          throw new Error(respErr);
        }

        return response.text();
      })
      .then(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          return response;
        }
      })
      .catch(e => {
        throw new Error(e.message);
      });

    if (models && syncLog) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        {
          $set: { responseData: realResponse, responseStr: JSON.stringify(realResponse) },
        },
      );
    }
    return realResponse;

  } catch (e) {
    throw new Error(e.message);
  }
};

export const sendMessageBrokerData = async (
  subdomain,
  serviceName: "core" | "savings" | "loans",
  action:
    | "getConfig"
    | "customers.findOne"
    | "contractType.findOne"
    | "contracts.findOne",
  data
) => {
  return await sendCommonMessage({
    subdomain,
    action,
    serviceName,
    data,
    isRPC: true
  });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCommonMessage({
    subdomain,
    action: "getConfig",
    serviceName: "core",
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getCustomer = async (subdomain: string, _id: string) => {
  return await sendCommonMessage({
    subdomain,
    action: 'customers.findOne',
    serviceName: 'core',
    data: { _id },
    isRPC: true
  });
};

export const updateCustomer = async (subdomain, query, data) => {
  return await sendCommonMessage({
    subdomain,
    action: "customers.updateOne",
    serviceName: "core",
    data: {
      selector: query,
      modifier: { $set: data }
    },
    isRPC: true
  });
};

export const getBranch = async (subdomain, _id) => {
  return await sendCommonMessage({
    subdomain,
    action: "branches.findOne",
    serviceName: "core",
    data: { _id },
    isRPC: true
  });
};

export const updateContract = async (
  subdomain,
  selector,
  updateData,
  serviceName
) => {
  return await sendCommonMessage({
    subdomain,
    action: "contracts.update",
    serviceName: serviceName,
    data: {
      selector: selector,
      modifier: updateData
    },
    isRPC: true
  });
};

export const getUser = async (subdomain, id) => {
  return await sendCommonMessage({
    subdomain,
    action: "users.findOne",
    serviceName: "core",
    data: { _id: id },
    isRPC: true
  });
};

export const getCloseInfo = async (
  subdomain: string,
  contractId: string,
  closeDate: Date
) => {
  return await sendCommonMessage({
    subdomain,
    action: "contractType.findOne",
    serviceName: "loans",
    data: { contractId, closeDate },
    isRPC: true
  });
};

export const getDepositAccount = async (
  subdomain: string,
  customerId: string
) => {
  return await sendCommonMessage({
    subdomain,
    action: "contracts.getDepositAccount",
    serviceName: "savings",
    data: { customerId },
    isRPC: true
  });
};

export const genObjectOfRule = async (
  subdomain,
  customFieldType: CustomFieldType,
  object,
  convertConfig
) => {
  const result = {};
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: 'core',
    action: 'fields.find',
    data: {
      query: {
        contentType: customFieldType
      },
      projection: {
        groupId: 1,
        code: 1,
        isDefinedByErxes: 1,
        type: 1,
        _id: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });

  for (const key of Object.keys(convertConfig)) {
    const conf = convertConfig[key];
    if (!conf.value && !conf.propType && !conf.fieldId) {
      continue;
    }

    if (conf.type === 'form') {
      if (conf.propType) {
        result[key] = object[conf.propType]
      } else {
        const field = fields.find(f => f._id === conf.fieldId)
        const customData = (object.customFieldsData || []).find(cfd => cfd.field === field._id);
        result[key] = customData?.value;
      }
    } else {
      result[key] = conf.value;
    }
  }

  return result;
};

export const customFieldToObject = async (
  subdomain,
  customFieldType: CustomFieldType,
  object
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: "core",
    action: "fields.find",
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: "" }
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });
  const customFieldsData: any[] = object.customFieldsData || [];
  for (const f of fields) {
    const existingData = customFieldsData.find(c => c.field === f._id);
    object[f.code] = existingData?.value;
  }

  return object;
};

export const getCustomFields = async (
  subdomain,
  customFieldType: CustomFieldType
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: "core",
    action: "fields.find",
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: "" }
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });
  return fields;
};

export const getProduct = async (subdomain: string, _id: string, serverName: string) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contractType.findOne',
    serviceName: serverName,
    data: { _id },
    isRPC: true
  });
};

export const getContract = async (subdomain, data, serviceName) => {
  return await sendCommonMessage({
    subdomain,
    action: 'contracts.findOne',
    serviceName: serviceName,
    data: data,
    isRPC: true
  });
};

export const getBoolean = value => {
  if (value === 1) return true;
  return false;
};

export const getBooleanToNumber = value => {
  if (value === true) return 1;
  return 0;
};

export const getClassificationCode = classificationCode => {
  switch (classificationCode) {
    case "NORMAL":
      return "1";
    case "EXPIRED":
      return "2";
    case "DOUBTFUL":
      return "3";
    case "NEGATIVE":
      return "4";
    case "BAD":
      return "5";

    default:
      return "1";
  }
};

export const getLoanContractAccount = (contractType, loanContract) => {
  switch (loanContract.classification) {
    case "NORMAL":
      return contractType.config.normalAccount;
    case "EXPIRED":
      return contractType.config.expiredAccount;
    case "DOUBTFUL":
      return contractType.config.doubtfulAccount;
    case "NEGATIVE":
      return contractType.config.negativeAccount;
    case "BAD":
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
