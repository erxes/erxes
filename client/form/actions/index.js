import { FORM_TOGGLE } from '../constants';

export const toggle = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    isFormVisible: isVisible,
  }, '*');

  return {
    type: FORM_TOGGLE,
  };
};
