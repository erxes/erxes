import { SHOUTBOX_FORM_TOGGLE, FORM_SUBMITTED } from './constants';

// Indicates messenger box's visibility.
const isShoutboxFormVisible = (state = false, action) => {
  switch (action.type) {
    case SHOUTBOX_FORM_TOGGLE:
      return action.isVisible;

    default:
      return state;
  }
};

// Indicates whether a conversation is created successfully
const submitResponse = (state = {}, action) => {
  if (action.type === FORM_SUBMITTED) {
    return {
      status: action.status,
      errors: action.errors,
    };
  }

  return state;
};

const form = {
  isShoutboxFormVisible,
  submitResponse,
};

export default form;
