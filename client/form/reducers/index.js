import { FORM_TOGGLE } from '../constants';

// Indicates messenger box's visibility.
const isVisible = (state = false, action) => {
  switch (action.type) {
    case FORM_TOGGLE:
      return !state;

    default:
      return state;
  }
};

const form = {
  isVisible,
};

export default form;
