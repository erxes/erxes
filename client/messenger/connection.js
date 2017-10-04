import gql from 'graphql-tag';
import client from '../apollo-client';

export const connection = {
  setting: {},
  data: {},
  queryVariables: '$integrationId: String!, $customerId: String!',
  queryParams: 'integrationId: $integrationId, customerId: $customerId',
};

export const connect = variables =>
  // call connect mutation
  client.mutate({
    mutation: gql`
      mutation connect($brandCode: String!, $email: String, $phone: String,
        $name: String, $isUser: Boolean, $data: JSON,
        $browserInfo: JSON, $cachedCustomerId: String) {

        messengerConnect(brandCode: $brandCode, email: $email, phone: $phone,
          name: $name, isUser: $isUser, data: $data, browserInfo: $browserInfo,
          cachedCustomerId: $cachedCustomerId) {

          integrationId,
          messengerData,
          uiOptions,
          customerId,
        }
      }`,

    variables,
  });


// get local storage
const getLocalStorage = () => {
  const brandId = connection.setting.brand_id;

  const erxesConfig = JSON.parse(localStorage.getItem('erxes') || '{}');

  return erxesConfig[brandId] || {};
}

// get local storage item
export const getLocalStorageItem = (key) => {
  const erxesStorage = getLocalStorage();

  return erxesStorage[key];
};

// set local storage item
export const setLocalStorageItem = (key, value) => {
  const brandId = connection.setting.brand_id;

  const erxesStorage = JSON.parse(localStorage.getItem('erxes') || '{}');
  const brandConfig = erxesStorage[brandId] || {};

  brandConfig[key] = value;

  // replace data with brandId
  erxesStorage[brandId] = brandConfig;

  localStorage.setItem('erxes', JSON.stringify(erxesStorage));
};
