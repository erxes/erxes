import { FORM_TOGGLE, CONVERSATION_SENT } from '../constants';
import { EMAIL_LOCAL_STORAGE_KEY } from '../constants';


/**
 * Indicates messenger box's visibility.
 */
const isVisible = (state = false, action) => {
  switch (action.type) {
    case FORM_TOGGLE:
      return !state;

    default:
      return state;
  }
};

/**
 * Indicates whether a conversation is created successfully
 */
const isConversationSent = (state = false, action) => {
  switch (action.type) {
    case CONVERSATION_SENT:
      return true;

    default:
      return state;
  }
};

const cachedEmail = () =>
  localStorage.getItem(EMAIL_LOCAL_STORAGE_KEY);

const form = {
  isVisible,
  isConversationSent,
  cachedEmail,
};

export default form;
