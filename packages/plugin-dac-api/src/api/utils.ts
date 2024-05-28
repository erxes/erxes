import fetch from 'node-fetch';
import { getConfig } from '../utils';

// ************************* common methods ************************* //

export const getConfigs = async () => {
  return {
    OrchardApi: await getConfig('ORCHARD_API_URL'),
    OrchardUsername: await getConfig('ORCHARD_USERNAME'),
    OrchardPassword: await getConfig('ORCHARD_PASSWORD'),
  };
};

export const getToken = async () => {
  const DacApi = await getConfigs();

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: DacApi.OrchardUsername,
      password: DacApi.OrchardPassword,
    }),
  };

  try {
    const res = await fetch(`${DacApi.OrchardApi}/mobile/token`, options).then(
      (res) => res.json(),
    );

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
  method: string,
  action: string,
  data?: any,
) => {
  try {
    const token = await getToken();
    const DacApi = await getConfigs();

    const options = {
      method,

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    };

    return fetch(`${DacApi.OrchardApi}/mobile/api/v1/${action}`, options).then(
      (res) => res.json(),
    );
  } catch (e) {
    throw new Error(
      'Error has occured while sending request to orchard: ' + e.message,
    );
  }
};

// ************************* customer methods ************************* //

export const getCustomer = async (phone: string) => {
  try {
    return sendRequestToOrchard('GET', `customer?cellular=${phone}`);
  } catch (e) {
    throw new Error('Failed to get customer by phone: ' + e.message);
  }
};

export const getCustomerById = async (idnumber: string) => {
  try {
    return sendRequestToOrchard('GET', `customer/${idnumber}`);
  } catch (e) {
    throw new Error('Failed to get customer by id: ' + e.message);
  }
};

export const createCustomer = async (doc: any) => {
  try {
    return sendRequestToOrchard('POST', 'customer', doc);
  } catch (e) {
    throw new Error('Failed to create customer: ' + e.message);
  }
};

export const updateCustomer = async (doc: any) => {
  try {
    return sendRequestToOrchard('PUT', 'customer', doc);
  } catch (e) {
    throw new Error('Failed to update customer: ' + e.message);
  }
};

export const updatePinCode = async (cardcode: string, pincode: string) => {
  try {
    return sendRequestToOrchard('PUT', 'customer/pin', {
      cardcode,
      pincode,
    });
  } catch (e) {
    throw new Error('Failed to update pin code: ' + e.message);
  }
};

// ************************* vehicle methods ************************* //

export const getVehicle = async (plate: string) => {
  try {
    return sendRequestToOrchard('GET', `vehicle/${plate}`);
  } catch (e) {
    throw new Error('Failed to get vehicle by plate: ' + e.message);
  }
};

export const createVehicle = async (doc: any) => {
  try {
    return sendRequestToOrchard('POST', 'vehicle', doc);
  } catch (e) {
    throw new Error('Failed to create vehicle: ' + e.message);
  }
};

export const updateVehicle = async (subdomain: string, doc: any) => {
  try {
    return sendRequestToOrchard('PUT', 'vehicle', doc);
  } catch (e) {
    throw new Error('Failed to update vehicle: ' + e.message);
  }
};
