import gql from 'graphql-tag';

import {
  MESSENGER_TOGGLE,
  CHANGE_ROUTE,
  CHANGE_CONVERSATION,
  BROWSER_INFO_SAVED,
} from '../constants';

import {
  connection,
  setLocalStorageItem,
  getLocalStorageItem,
} from '../connection';

import { postMessage, requestBrowserInfo } from '../../utils';

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

export const saveBrowserInfo = () => async (dispatch) => {
  requestBrowserInfo({
    source: 'fromMessenger',
    callback: (browserInfo) => {
      const variables = {
        customerId: connection.data.customerId,
        browserInfo
      };

      client.mutate({
        mutation: gql`
          mutation saveBrowserInfo($customerId: String!  $browserInfo: JSON!) {
            saveBrowserInfo(customerId: $customerId browserInfo: $browserInfo) {
              _id
            }
          }
        `,
        variables,
      })

      .then(() => {
        dispatch({ type: BROWSER_INFO_SAVED });
      });
    }
  })
};

export const toggle = (isVisible) => {
  // notify parent window launcher state
  postMessage('fromMessenger', 'messenger', { isVisible: !isVisible });

  return {
    type: MESSENGER_TOGGLE,
  };
};

export const toggleNotifer = (isVisible) => {
  // notify state
  postMessage('fromMessenger', 'notifier', { isVisible: !isVisible });
};

export const toggleNotiferFull = (isVisible) => {
  // notify state
  postMessage('fromMessenger', 'notifierFull', { isVisible: !isVisible });
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


export const endConversation = () => () => {
  const setting = connection.setting;

  // ignore this action for inapp
  if (setting.email) {
    return;
  }

  // reset local storage items
  setLocalStorageItem('getNotifiedType', '');
  setLocalStorageItem('getNotifiedValue', '');
  setLocalStorageItem('lastConversationId', '');
  setLocalStorageItem('customerId', '');

  window.location.reload();
};
