/* global window */

import gql from 'graphql-tag';

import {
  MESSENGER_TOGGLE,
  CHANGE_ROUTE,
  CHANGE_CONVERSATION,
  END_CONVERSATION,
} from '../constants';

import {
  connection,
  setLocalStorageItem,
  getLocalStorageItem,
} from '../connection';

import { getBrowserInfo } from '../../utils';

import client from '../../apollo-client';

export const connect = variables =>
  // call connect mutation
  client.mutate({
    mutation: gql`
      mutation connect($brandCode: String!, $email: String, $phone: String,
        $isUser: Boolean, $data: JSON,
        $companyData: JSON, $cachedCustomerId: String) {

        messengerConnect(brandCode: $brandCode, email: $email, phone: $phone,
          isUser: $isUser, data: $data, companyData: $companyData,
          cachedCustomerId: $cachedCustomerId) {

          integrationId,
          messengerData,
          languageCode,
          uiOptions,
          customerId,
        }
      }`,

    variables,
  });

export const saveBrowserInfo = async variables => {
  variables.browserInfo = await getBrowserInfo();

  client.mutate({
    mutation: gql`
      mutation saveBrowserInfo($customerId: String! $browserInfo: JSON!) {
        saveBrowserInfo(customerId: $customerId browserInfo: $browserInfo)
      }
    `,
    variables,
  });
};

export const toggle = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    fromMessenger: true,
    purpose: 'messenger',
    isVisible: !isVisible,
  }, '*');

  return {
    type: MESSENGER_TOGGLE,
  };
};

export const toggleNotifer = (isVisible) => {
  // notify state
  window.parent.postMessage({
    fromErxes: true,
    fromMessenger: true,
    purpose: 'notifier',
    isVisible: !isVisible,
  }, '*');
};

export const toggleNotiferFull = (isVisible) => {
  // notify state
  window.parent.postMessage({
    fromErxes: true,
    fromMessenger: true,
    purpose: 'notifierFull',
    isVisible: !isVisible,
  }, '*');
};


export const changeRoute = route => ({
  type: CHANGE_ROUTE,
  route,
});

export const changeConversation = (_id) => (dispatch) => {
  // save last conversationId
  setLocalStorageItem('lastConversationId', _id);

  dispatch({ type: CHANGE_CONVERSATION, conversationId: _id });
  dispatch({ type: CHANGE_ROUTE, route: _id ? 'conversationDetail' : 'conversationCreate' });
};

export const openLastConversation = () => (dispatch) => {
  const _id = getLocalStorageItem('lastConversationId');

  dispatch({ type: CHANGE_CONVERSATION, conversationId: _id });
  dispatch({ type: CHANGE_ROUTE, route: _id ? 'conversationDetail' : 'conversationCreate' });
};

export const saveGetNotified = ({ type, value }) => (dispatch) => {
  if (!value) {
    return;
  }

  client.mutate({
    mutation: gql`
      mutation saveCustomerGetNotified($customerId: String!, $type: String!, $value: String!) {
        saveCustomerGetNotified(customerId: $customerId, type: $type, value: $value)
      }`,

    variables: {
      customerId: connection.data.customerId,
      type,
      value,
    },
  })

  // after mutation
  .then(() => {
    // save email
    setLocalStorageItem('getNotifiedType', type);
    setLocalStorageItem('getNotifiedValue', value);

    // redirect to conversation
    dispatch(openLastConversation());
  });
};


export const endConversation = () => (dispatch) => {
  const setting = connection.setting;
  const data = connection.data;

  // ignore this action for inapp
  if (setting.email) {
    return;
  }

  client.mutate({
    mutation: gql`
      mutation endConversation(
        $customerId: String
        $brandCode: String!
        $browserInfo: JSON!
        $data: JSON
      ) {
        endConversation(
          customerId: $customerId
          brandCode: $brandCode
          browserInfo: $browserInfo
          data: $data
        ) {
          customerId
        }
      }`,

    variables: {
      customerId: data.customerId,
      brandCode: setting.brand_id,
      data: setting.data,
      browserInfo: setting.browserInfo,
    },
  })

  // after mutation
  .then(({ data }) => {
    const { customerId } = data.endConversation;

    // reset local storage items
    setLocalStorageItem('getNotifiedType', '');
    setLocalStorageItem('getNotifiedValue', '');
    setLocalStorageItem('lastConversationId', '');
    setLocalStorageItem('customerId', customerId);

    // update connection customerId
    connection.data.customerId = customerId;

    dispatch({ type: CHANGE_CONVERSATION, conversationId: '' });
    dispatch({ type: END_CONVERSATION });
    dispatch({ type: CHANGE_ROUTE, route: 'accquireInformation' });
  });
};
