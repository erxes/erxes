import EJSON from 'meteor-ejson';
import { call } from '../erxes';
import uploadHandler from '../uploadHandler';


const Chat = {
  sendMessage(message, attachments) {
    return (dispatch, getState) => {
      // current conversation
      const currentConversationId = getState().chat.currentConversation;

      // message object
      const doc = {
        conversationId: currentConversationId,
        message,
        attachments,
      };

      return call('sendMessage', doc)
        .then(({ conversationId }) => {
          // if there is no current conversation new conversation will be created
          if (!currentConversationId) {
            dispatch({ type: 'CHANGE_CONVERSATION', conversationId });
          }
        });
    };
  },

  sendFile(file) {
    return (dispatch, getState) => {
      uploadHandler({
        file,
        uploadAction: ({ data, fileInfo }) => {
          dispatch({ type: 'SENDING_ATTACHMENT' });

          // file object
          const doc = {
            name: file.name,
            data: EJSON.toJSONValue(data),
          };

          call('sendFile', doc).then(response => {
            dispatch({ type: 'ATTACHMENT_SENT' });

            const attachment = Object.assign({ url: response.url }, fileInfo);

            // send message with attachment
            // QUESTION: Do we need to make 2 calls to send a message with attachment?
            this.sendMessage('This message has an attachment', [attachment])(dispatch, getState);
          });
        },
      });
    };
  },

  readMessages(conversationId) {
    return () => call('customerReadMessages', conversationId);
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
