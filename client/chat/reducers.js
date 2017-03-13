import {
  FORM_TOGGLE,
  EMAIL_LOCAL_STORAGE_KEY,
  NEW_CONVERSATION,
  STATUS_CHANGED,
} from './constants';

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
 * Indicates whether a conversation is created successfully or creating again
 */
const status = (state = NEW_CONVERSATION, action) => {
  switch (action.type) {
    case STATUS_CHANGED:
      return action.status;

    default:
      return state;
  }
};

const cachedEmail = () =>
  localStorage.getItem(EMAIL_LOCAL_STORAGE_KEY);

const form = {
  isVisible,
  status,
  cachedEmail,
};

export default form;
