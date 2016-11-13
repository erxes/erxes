import { combineReducers } from 'redux';
import { subscribeMessages } from '../erxes';


const message = (state, action) => {
  switch (action.type) {
    case 'SENDING_MESSAGE':
      return {
        _id: action._id,
        message: action.message,
        attachments: action.attachments,
        error: '',
        sentAt: new Date(),
        customerId: '1',
      };

    case 'MESSAGE_SENT':
      if (state._id !== action._id) {
        return state;
      }

      if (action.error) {
        return {
          ...state,
          customerId: '1',
          error: action.error,
          sentAt: new Date(),
        };
      }

      return {
        ...state,
        _id: action.realId,
        customerId: '1',
        sentAt: new Date(),
      };

    case 'MESSAGE_RECEIVED':
      return {
        _id: action._id,
        message: action.content,
        attachments: action.attachments,
        userId: action.userId,
        customerId: action.customerId,
        sentAt: new Date(action.createdAt.$date),
        error: '',
      };

    default:
      return state;
  }
};

const messages = (state = [], action) => {
  let old;

  switch (action.type) {
    case 'CHANGE_CONVERSATION':
      subscribeMessages(action.conversationId);

      return [];

    case 'SENDING_MESSAGE':
      old = state.findIndex(s => s._id === action._id);

      if (old !== -1) {
        state.splice(old, 1);
      }

      return [
        ...state,
        message(state, action),
      ];

    case 'MESSAGE_RECEIVED':
      old = state.findIndex(s => s._id === action._id);

      if (old === -1) {
        return [
          ...state,
          message(state, action),
        ];
      }

      state.splice(old, 1, message(state, action));
      return [...state];

    case 'MESSAGE_SENT':
      if (state.length === 1) {
        subscribeMessages();
      }

      old = state.findIndex(s => s._id === action._id);

      if (old > -1 && state.findIndex(s => s._id === action.realId) > -1) {
        // sent message recieved through subscription
        // so remove old message
        state.splice(old, 1);
      } else if (old > -1) {
        state.splice(old, 1, message(state[old], action));
      }

      return [...state];

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
