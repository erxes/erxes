import gql from 'graphql-tag';
import { SENDING_ATTACHMENT, ATTACHMENT_SENT, ASK_GET_NOTIFIED, MESSAGE_SENT } from '../constants';
import { connection, getLocalStorageItem } from '../connection';
import { changeConversation } from './messenger';
import queries from '../containers/graphql';
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

export const sendMessage = (message, attachments) =>
  (dispatch, getState) => {
    const state = getState();

    // current conversation
    const currentConversationId = state.activeConversation;

    let optimisticResponse;
    let update;

    // generate optimistic response
    if (currentConversationId) {
      optimisticResponse = {
        __typename: 'Mutation',
        insertMessage: {
          __typename: 'ConversationMessage',
          _id: Math.round(Math.random() * -1000000),
          conversationId: currentConversationId,
          customerId: connection.data.customerId,
          user: null,
          content: message,
          createdAt: Number(new Date()),
          attachments: attachments || [],
          internal: false,
          engageData: null
        }
      };

      update = (proxy, { data: { insertMessage } }) => {
        const message = insertMessage;

        const selector = {
          query: gql(queries.conversationDetailQuery),
          variables: { _id: message.conversationId }
        };

        // Read data from our cache for this query
        const data = proxy.readQuery(selector);

        const messages = data.conversationDetail.messages;

        // check duplications
        if (!messages.find(m => m._id === message._id)) {
          // Add our message from the mutation to the end
          messages.push(message);

          // Write out data back to the cache
          proxy.writeQuery({ ...selector, data });
        }
      }
    }

    return client.mutate({
      mutation: gql`
        mutation insertMessage(
            ${connection.queryVariables}
            $message: String
            $conversationId: String
            $attachments: [JSON]
          ) {

          insertMessage(
            ${connection.queryParams}
            message: $message
            conversationId: $conversationId
            attachments: $attachments
          ) {
            ${queries.messageFields}
          }
        }`,

      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        conversationId: currentConversationId,
        message,
        attachments,
      },
      optimisticResponse,
      update,
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
