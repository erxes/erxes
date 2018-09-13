import createConfirmation from './createConfirmation';

// create confirm function
const confirm = createConfirmation();

export default function(confirmation?: any, options?: any) {
  return confirm({ confirmation, options: options ? options : {} });
}
