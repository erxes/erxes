import { combineReducers } from 'redux';
import { subscribeMessages } from '../erxes';
import { MESSENGER_SHOW, MESSENGER_HIDE, CHANGE_ROUTE } from '../constants/messenger';


const message = (state, action) => {
  if (action.type === 'MESSAGE_RECEIVED') {
    return {
      _id: action._id,
      message: action.content,
      attachments: action.attachments,
      userId: action.userId,
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

const isVisible = (state = false, action) => {
  switch (action.type) {
    case MESSENGER_SHOW:
      return true;

    case MESSENGER_HIDE:
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
      {
        ...action,
        createdAt: new Date(action.createdAt.$date),
      },
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

const activeRoute = (state = 'conversationList', action) => {
  switch (action.type) {
    case CHANGE_ROUTE:
      return action.route;

    default:
      return state;
  }
};

const messenger = combineReducers({
  messages,
  currentConversation,
  conversations,
  isVisible,
  isAttachingFile,
  activeRoute,
});

export default messenger;
