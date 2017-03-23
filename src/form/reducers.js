import {
  SHOUTBOX_FORM_TOGGLE,
  INITIAL,
  ERROR,
  SUCCESS,
  FORM_SUBMIT,
  CREATE_NEW,
} from './constants';

// Indicates messenger box's visibility.
const isShoutboxFormVisible = (state = false, action) => {
  switch (action.type) {
    case SHOUTBOX_FORM_TOGGLE:
      return action.isVisible;

    default:
      return state;
  }
};

// Indicates whether form submitted with error, successfully or user clicked
// new button
const currentStatus = (state = { status: INITIAL }, action) => {
  // form submitted
  if (action.type === FORM_SUBMIT) {
    if (action.status === ERROR) {
      return {
        status: ERROR,
        errors: action.errors,
      };
    }

    return {
      status: SUCCESS,
    };
  }

  // create new button clicked
  if (action.type === CREATE_NEW) {
    return {
      status: INITIAL,
    };
  }

  return state;
};

const form = {
  isShoutboxFormVisible,
  currentStatus,
};

export default form;
