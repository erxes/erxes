/* global window */

import gql from 'graphql-tag';

import { MESSENGER_TOGGLE, CHANGE_ROUTE, CHANGE_CONVERSATION, SAVED_EMAIL } from '../constants';
import { connection } from '../connection';
import client from '../../apollo-client';

export const toggle = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    fromMessenger: true,
    isMessengerVisible: !isVisible,
  }, '*');

  return {
    type: MESSENGER_TOGGLE,
  };
};

export const changeRoute = route => ({
  type: CHANGE_ROUTE,
  route,
});

export const changeActiveConversation = conversationId => ({
  type: CHANGE_CONVERSATION,
  conversationId,
});

export const changeConversation = conversationId =>
  (dispatch) => {
    dispatch(changeActiveConversation(conversationId));
  };

export const saveEmail = email => dispatch =>
  client.mutate({
    mutation: gql`
      mutation saveCustomerEmail($customerId: String!, $email: String!) {
        saveCustomerEmail(customerId: $customerId, email: $email)
      }`,

    variables: {
      customerId: connection.data.customerId,
      email,
    },
  })

  // after mutation
  .then(() => {
    dispatch({ type: SAVED_EMAIL });
  });
