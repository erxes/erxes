import { combineReducers } from 'redux';
import { updateObject, updateItemInArray } from './utils';
import {
  CONVERSATION_RECEIVED,
  MESSAGE_RECEIVED,
  SENDING_ATTACHMENT,
  ATTACHMENT_SENT,
  MESSENGER_TOGGLE,
  CHANGE_ROUTE,
  CHANGE_CONVERSATION,
  USER_RECEIVED,
  USER_CHANGED,
  NOTIFICATION_RECEIVED,
} from '../constants';


/**
 * Indicates messenger box's visibility.
 */
const isVisible = (state = false, action) => {
  switch (action.type) {
    case MESSENGER_TOGGLE:
      return !state;

    default:
      return state;
  }
};

/**
 * Indicates which view is active.
 * Messenger box shows conversation list when appeared.
 */
const activeRoute = (state = 'conversationList', action) => {
  switch (action.type) {
    case CHANGE_ROUTE:
      return action.route;

    default:
      return state;
  }
};

/**
 * All conversations sent by the customer.
 */
const conversations = (state = [], action) => {
  if (action.type === CONVERSATION_RECEIVED) {
    return [
      ...state,
      {
        ...action.conversation,

        // TODO: Why is createdAt field is so strange?
        createdAt: new Date(action.conversation.createdAt.$date),
      },
    ];
  }

  return state;
};

/**
 * Active conversation that shows up on conversation details view.
 */
const activeConversation = (state = '', action) => {
  if (action.type === CHANGE_CONVERSATION) {
    return action.conversationId;
  }

  return state;
};

/**
 * Active conversation's messages.
 */
const messages = (state = [], action) => {
  switch (action.type) {
    case CHANGE_CONVERSATION:
      return [];

    case MESSAGE_RECEIVED:
      return [
        ...state,
        {
          _id: action.message._id,
          message: action.message.content,
          attachments: action.message.attachments,
          userId: action.message.userId,
          sentAt: new Date(action.message.createdAt.$date),
          error: '',
        },
      ];

    default:
      return state;
  }
};

/**
 * Indicates whether a file is being attached.
 * Used for file attachment progress.
 */
const isAttachingFile = (state = false, action) => {
  switch (action.type) {
    case SENDING_ATTACHMENT:
      return true;

    case ATTACHMENT_SENT:
      return false;

    default:
      return state;
  }
};

/**
 * Service staffs from all conversations
 */
const users = (state = [], action) => {
  switch (action.type) {
    case USER_RECEIVED: {
      /**
       * If received user is already in the users list
       * the old one will be updated with new one.
       * If the user isn't in the list, it will be appended.
       */
      return state.find(user => user._id === action.user._id)
        ? updateItemInArray(state, action.user._id, () => action.user)
        : [...state, action.user];
    }

    case USER_CHANGED:
      return updateItemInArray(state, action.user._id, (item) => {
        const updated = updateObject(item, action.user);
        if (action.cleared) {
          action.cleared.forEach(c => delete updated[c]);
        }
        return updated;
      });

    default:
      return state;
  }
};

const notifications = (state = {}, action) => {
  let conversationId = '';

  switch (action.type) {
    case NOTIFICATION_RECEIVED:
      conversationId = action.name.replace('unreadMessagesCount_', '');
      return {
        ...state,
        [conversationId]: action.count,
      };

    default:
      return state;
  }
};


const messenger = combineReducers({
  isVisible,
  activeRoute,
  conversations,
  activeConversation,
  messages,
  isAttachingFile,
  users,
  notifications,
});

export default messenger;
