import EJSON from 'meteor-ejson';
import { call } from '../erxes';
import uploadHandler from '../uploadHandler';


let nextMessageId = 0;

const Chat = {
  sendMessage(message, attachments, id) {
    return dispatch => {
      let _id = id;

      if (!_id) {
        _id = `${nextMessageId++}`;
      }

      dispatch({
        type: 'SENDING_MESSAGE',
        _id,
        message,
        attachments,
      });

      return call('sendMessage', { message, attachments })
        .then(realId =>
          dispatch({
            type: 'MESSAGE_SENT',
            _id,
            realId,
          })
        )
        .catch(error =>
          dispatch({
            type: 'MESSAGE_SENT',
            _id,
            error: error.reason || error.message || error.toString(),
          })
        );
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
