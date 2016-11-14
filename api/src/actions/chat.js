import EJSON from 'meteor-ejson';
import { call } from '../erxes';
import uploadHandler from '../uploadHandler';

const Chat = {
  sendMessage(message, attachments) {
    return (dispatch, getState) => {
      // get current conversation
      const chatState = getState().chat;
      const currentConversation = chatState.currentConversation;

      // send message data
      const doc = { message, attachments, ticketId: currentConversation };

      return call('sendMessage', doc)
        .then(({ conversationId }) => {
          // if creating new conversation then update current conversation
          if (!currentConversation) {
            dispatch({ type: 'CHANGE_CONVERSATION', conversationId });
          }
        });
    };
  },

  sendFile(file) {
    return dispatch => {
      uploadHandler({
        file,
        uploadAction: ({ data, fileInfo }) => {
          dispatch({
            type: 'SENDING_ATTACHMENT',
          });

          // upload file
          const doc = { name: file.name, data: EJSON.toJSONValue(data) };

          call('sendFile', doc).then(response => {
            dispatch({
              type: 'ATTACHMENT_SENT',
            });

            const attachment = Object.assign({ url: response.url }, fileInfo);

            this.sendMessage(
              'This message has an attachment',
              [attachment]
            )(dispatch);
          });
        },
      });
    };
  },

  changeConversation(conversationId) {
    return {
      type: 'CHANGE_CONVERSATION',
      conversationId,
    };
  },

  toMessageForm(state) {
    return {
      type: 'TO_MESSAGE_FORM',
      state,
    };
  },

  show() {
    return {
      type: 'SHOW_CHATBOX',
    };
  },

  hide() {
    return {
      type: 'HIDE_CHATBOX',
    };
  },
};

export default Chat;
