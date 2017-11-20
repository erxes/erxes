import gql from 'graphql-tag';
import { SENDING_ATTACHMENT, ATTACHMENT_SENT, ASK_GET_NOTIFIED, MESSAGE_SENT } from '../constants';
import { connection, getLocalStorageItem } from '../connection';
import { changeConversation } from './messenger';
import client from '../../apollo-client';
import uploadHandler from '../../uploadHandler';

export const readMessages = conversationId => () => {
  client.mutate({
    mutation: gql`
      mutation readConversationMessages($conversationId: String) {
        readConversationMessages(conversationId: $conversationId)
      }`,

    variables: { conversationId },
  });
}

export const readEngageMessage = ({ engageData }) => () =>
  client.mutate({
    mutation: gql`
      mutation readEngageMessage($messageId: String!, $customerId: String!) {
        readEngageMessage(messageId: $messageId, customerId: $customerId)
      }`,

    variables: {
      messageId: engageData.messageId,
      customerId: connection.data.customerId,
    },
  });

export const sendMessage = (message, attachments) =>
  (dispatch, getState) => {
    const state = getState();

    // current conversation
    const currentConversationId = state.activeConversation;

    return client.mutate({
      mutation: gql`
        mutation insertMessage(${connection.queryVariables}, $message: String,
            $conversationId: String, $attachments: [JSON]) {

          insertMessage(${connection.queryParams}, message: $message,
            conversationId: $conversationId, attachments: $attachments) {
            _id
            conversationId
          }
        }`,

      variables: {
        ...connection.data,
        conversationId: currentConversationId,
        message,
        attachments,
      },
    })

    // after mutation
    .then(({ data }) => {
      const message = data.insertMessage;

      dispatch({ type: MESSAGE_SENT });

      if (!currentConversationId) {
        dispatch(changeConversation(message.conversationId));
      }
    });
  };

export const sendFile = file =>
  (dispatch, getState) => {
    const { email, phone } = connection.setting;

    // if visitor did not give email or phone then ask
    if (!(email || phone) && !getLocalStorageItem('getNotifiedType')) {
      dispatch({ type: ASK_GET_NOTIFIED });
    }

    return uploadHandler({
      file,

      beforeUpload() {
        dispatch({ type: SENDING_ATTACHMENT });
      },

      // upload to server
      afterUpload({ response, fileInfo }) {
        dispatch({ type: ATTACHMENT_SENT });

        const attachment = Object.assign({ url: response }, fileInfo);

        // send message with attachment
        sendMessage('This message has an attachment', [attachment])(dispatch, getState);
      }
    });
  };
