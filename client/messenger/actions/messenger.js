/* global window */

import {
  MESSENGER_TOGGLE,
  CHANGE_ROUTE,
  CHANGE_CONVERSATION,
  RECEIVE_EMAIL,
  EMAIL_LOCAL_STORAGE_KEY,
} from '../constants';

import { connection, connect } from '../connection';
import { sendMessage } from './messages';

export const toggle = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
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

export const sendVisitorFirstMessage = (email, message) =>
  (dispatch) => {
    // save email to local storage
    localStorage.setItem(EMAIL_LOCAL_STORAGE_KEY, email);

    // call connect mutation
    connect({
      brandCode: connection.settings.brand_id,
      name: connection.settings.name,
      isUser: false,
      email,
    })

    .then(({ data }) => {
      const messengerData = data.messengerConnect;

      // save connection info
      connection.data = messengerData;

      // call send message mutation
      dispatch(sendMessage(message))

      .then(() => {
        // change route
        dispatch(changeRoute('conversation'));

        // mark as email received
        dispatch({ type: RECEIVE_EMAIL });
      });
    })

    .catch((error) => {
      console.log(error); // eslint-disable-line
    });
  };
