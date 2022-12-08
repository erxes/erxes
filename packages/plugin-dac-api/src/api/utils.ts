import { sendRequest } from '@erxes/api-utils/src/requests';
import { getConfig } from '../utils';

// ************************* common methods ************************* //

export const getConfigs = async () => {
  return {
    OrchardApi: await getConfig('ORCHARD_API_URL'),
    OrchardUsername: await getConfig('ORCHARD_USERNAME'),
    OrchardPassword: await getConfig('ORCHARD_PASSWORD')
  };
};

export const getToken = async () => {
  const DacApi = await getConfigs();

  const options = {
    method: 'POST',
    url: `${DacApi.OrchardApi}/mobile/token`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      username: DacApi.OrchardUsername,
      password: DacApi.OrchardPassword
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
    const token = await getToken();
    const DacApi = await getConfigs();

    const options = {
      method,
      url: `${DacApi.OrchardApi}/mobile/api/v1/${action}`,
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
    return sendRequestToOrchard(subdomain, 'POST', 'customer', doc);
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
