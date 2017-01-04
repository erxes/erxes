import { FORM_TOGGLE, CONVERSATION_SENT } from '../constants';


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

const form = {
  isVisible,
  isConversationSent,
};

export default form;
