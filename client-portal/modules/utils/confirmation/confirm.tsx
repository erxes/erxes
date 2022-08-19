import createConfirmation from './createConfirmation';

// create confirm function
const confirm = createConfirmation();

export default function (confirmation?: string, options?: {}) {
  return confirm({ confirmation, options: options || {} });
}
