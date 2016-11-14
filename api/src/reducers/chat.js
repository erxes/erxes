import { combineReducers } from 'redux';
import { subscribeMessages } from '../erxes';


const message = (state, action) => {
  if (action.type === 'MESSAGE_RECEIVED') {
    return {
      _id: action._id,
      message: action.content,
      attachments: action.attachments,
      userId: action.userId,
      customerId: action.customerId,
      sentAt: new Date(action.createdAt.$date),
      error: '',
    };
  }

  return state;
};

const messages = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_CONVERSATION':
      subscribeMessages(action.conversationId);

      return [];

    case 'MESSAGE_RECEIVED':
      return [
        ...state,
        message(state, action),
      ];

    default:
      return state;
  }
};

const visibility = (state = false, action) => {
  switch (action.type) {
    case 'SHOW_CHATBOX':
      return true;

    case 'HIDE_CHATBOX':
      return false;

    default:
      return state;
  }
};

const isAttachingFile = (state = false, action) => {
  switch (action.type) {
    case 'SENDING_ATTACHMENT':
      return true;

    case 'ATTACHMENT_SENT':
      return false;

    default:
      return state;
  }
};

const conversations = (state = [], action) => {
  if (action.type === 'CONVERSATION_RECEIVED') {
    return [
      ...state,
      action,
    ];
  }

  return state;
};

const currentConversation = (state = '', action) => {
  if (action.type === 'CHANGE_CONVERSATION') {
    return action.conversationId;
  }

  return state;
};

const showMessageForm = (state = false, action) => {
  if (action.type === 'TO_MESSAGE_FORM') {
    return action.state;
  }

  return state;
};

const chat = combineReducers({
  messages,
  currentConversation,
  showMessageForm,
  conversations,
  isVisible: visibility,
  isAttachingFile,
});

export default chat;
