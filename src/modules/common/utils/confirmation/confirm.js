import createConfirmation from './createConfirmation';

// create confirm function
const confirm = createConfirmation();

export default function(confirmation, options = {}) {
  return confirm({ confirmation, options });
}
