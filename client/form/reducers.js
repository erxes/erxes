import { FORM_TOGGLE, FORM_SUBMITTED } from './constants';

// Indicates messenger box's visibility.
const isVisible = (state = false, action) => {
  switch (action.type) {
    case FORM_TOGGLE:
      return !state;

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
  isVisible,
  submitResponse,
};

export default form;
