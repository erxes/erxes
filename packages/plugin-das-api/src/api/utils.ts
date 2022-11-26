import {
  removeExtraSpaces,
  removeLastTrailingSlash
} from '@erxes/api-utils/src/commonUtils';
import { sendRequest } from '@erxes/api-utils/src/requests';

import redis from '../redis';
import { sendCoreMessage } from './../messageBroker';
import { CONFIG_KEYS } from './constants';

// ************************* common methods ************************* //
const getConfigs = async (subdomain: string) => {
  const response = await redis.get('orchardConfigs');
  const configsOnRedis = JSON.parse(response || '{}');

  if (Object.keys(configsOnRedis).length > 0) {
    CONFIG_KEYS.ALL.forEach(key => {
      if (!configsOnRedis[key]) {
        configsOnRedis[key] = '';
      }
    });
    return configsOnRedis;
  }

  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: {}
  });

  const { ORCHARD_API_URL, ORCHARD_USERNAME, ORCHARD_PASSWORD } = configs;

  if (!ORCHARD_API_URL || !ORCHARD_USERNAME || !ORCHARD_PASSWORD) {
    throw new Error('Orchard configs are not set properly');
  }

  const configsToSave = {
    ORCHARD_API_URL: removeLastTrailingSlash(ORCHARD_API_URL),
    ORCHARD_USERNAME,
    ORCHARD_PASSWORD
  };

  await redis.set('orchardConfigs', JSON.stringify(configsToSave));

  return configsToSave;
};

const getApiUrl = async (subdomain: string) => {
  const configs = await getConfigs(subdomain);

  const { ORCHARD_API_URL } = configs;

  return removeExtraSpaces(removeLastTrailingSlash(ORCHARD_API_URL));
};

export const getToken = async (subdomain: string) => {
  const configs = await getConfigs(subdomain);

  const { ORCHARD_API_URL, ORCHARD_USERNAME, ORCHARD_PASSWORD } = configs;

  const baseApiUrl = removeExtraSpaces(
    removeLastTrailingSlash(ORCHARD_API_URL)
  );

  const options = {
    method: 'POST',
    url: `${baseApiUrl}/mobile/token`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      username: ORCHARD_USERNAME,
      password: ORCHARD_PASSWORD
    }
  };

  try {
    const res = await sendRequest(options);

    const { description, access_token } = res;

    if (description !== 'Success') {
      throw new Error('Orchard token is not generated: ' + description);
    }

    return access_token;
  } catch (e) {
    throw new Error('Failed to get token: ' + e.message);
  }
};

const sendRequestToOrchard = async (
  subdomain: string,
  method: string,
  action: string,
  data?: any
) => {
  try {
    const token = await getToken(subdomain);
    const baseApiUrl = await getApiUrl(subdomain);

    const options = {
      method,
      url: `${baseApiUrl}/mobile/api/v1/${action}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: data
    };

    return sendRequest(options);
  } catch (e) {
    throw new Error(
      'Error has occured while sending request to orchard: ' + e.message
    );
  }
};

// ************************* customer methods ************************* //

export const getCustomer = async (subdomain: string, phone: string) => {
  try {
    return sendRequestToOrchard(subdomain, 'GET', `customer?cellular=${phone}`);
  } catch (e) {
    throw new Error('Failed to get customer by phone: ' + e.message);
  }
};

export const getCustomerById = async (subdomain: string, idnumber: string) => {
  try {
    return sendRequestToOrchard(subdomain, 'GET', `customer/${idnumber}`);
  } catch (e) {
    throw new Error('Failed to get customer by id: ' + e.message);
  }
};

export const createCustomer = async (subdomain: string, doc: any) => {
  try {
    return sendRequestToOrchard(subdomain, 'POST', 'customer', doc);
  } catch (e) {
    throw new Error('Failed to create customer: ' + e.message);
  }
};

export const updateCustomer = async (subdomain: string, doc: any) => {
  try {
    return sendRequestToOrchard(subdomain, 'PUT', 'customer', doc);
  } catch (e) {
    throw new Error('Failed to update customer: ' + e.message);
  }
};

export const updatePinCode = async (
  subdomain: string,
  cardcode: string,
  pincode: string
) => {
  try {
    return sendRequestToOrchard(subdomain, 'PUT', 'customer/pin', {
      cardcode,
      pincode
    });
  } catch (e) {
    throw new Error('Failed to update pin code: ' + e.message);
  }
};

// ************************* vehicle methods ************************* //

export const getVehicle = async (subdomain: string, plate: string) => {
  try {
    return sendRequestToOrchard(subdomain, 'GET', `vehicle/${plate}`);
  } catch (e) {
    throw new Error('Failed to get vehicle by plate: ' + e.message);
  }
};

export const createVehicle = async (subdomain: string, doc: any) => {
  try {
    return sendRequestToOrchard(subdomain, 'POST', 'vehicle', doc);
  } catch (e) {
    throw new Error('Failed to create vehicle: ' + e.message);
  }
};

export const updateVehicle = async (subdomain: string, doc: any) => {
  try {
    return sendRequestToOrchard(subdomain, 'PUT', 'vehicle', doc);
  } catch (e) {
    throw new Error('Failed to update vehicle: ' + e.message);
  }
};
