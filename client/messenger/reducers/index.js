import {
  SENDING_ATTACHMENT,
  MESSAGE_SENT,
  ATTACHMENT_SENT,
  MESSENGER_TOGGLE,
  CHANGE_ROUTE,
  CHANGE_CONVERSATION,
  END_CONVERSATION,
  ENGAGE_MESSAGES_CREATED,
} from '../constants';

import {
  connection,
  getLocalStorageItem,
} from '../connection';

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
  if (action.type === CHANGE_ROUTE) {
    return action.route;
  }

  const { email, phone } = connection.setting;

  // if visitor did not give email or phone then ask
  if (!(email || phone) && !getLocalStorageItem('getNotifiedType')) {
    return 'accquireInformation'
  }

  return state;
};


/**
 * Active conversation that shows up on conversation details view.
 */
const activeConversation = (state = '', action) => {
  if (action.type === CHANGE_CONVERSATION) {
    return action.conversationId || '';
  }

  return state;
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

const isConversationEnded = (state = false, action) => {
  if (action.type === END_CONVERSATION) {
    return true;
  }

  if (action.type === MESSAGE_SENT) {
    return false;
  }

  return state;
};

const isEngageMessagesCreated = (state = false, action) => {
  if (action.type === ENGAGE_MESSAGES_CREATED) {
    return true;
  }

  return state;
};

const messenger = {
  isVisible,
  activeRoute,
  activeConversation,
  isAttachingFile,
  isConversationEnded,
  isEngageMessagesCreated,
};

export default messenger;
