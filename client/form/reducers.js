import {
  SHOW_CALLOUT,
  HIDE_CALLOUT,
  SHOW_FORM,
  HIDE_FORM,
  SHOW_POPUP,
  HIDE_POPUP,
  INITIAL,
  ERROR,
  SUCCESS,
  FORM_SUBMIT,
  CREATE_NEW,
} from './constants';

// Is popup visible
const isPopupVisible = (state = false, action) => {
  switch (action.type) {
    case HIDE_POPUP:
      return false;

    case SHOW_POPUP:
      return true;

    default:
      return state;
  }
};

// Is form visible
const isFormVisible = (state = false, action) => {
  switch (action.type) {
    case HIDE_FORM:
      return false;

    case SHOW_FORM:
      return true;

    default:
      return state;
  }
};

// Is callout visible
const isCalloutVisible = (state = false, action) => {
  switch (action.type) {
    case SHOW_CALLOUT:
      return true;

    case HIDE_CALLOUT:
      return false;

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
  isPopupVisible,
  isFormVisible,
  isCalloutVisible,
  currentStatus,
};

export default form;
