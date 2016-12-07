import { MESSENGER_SHOW, MESSENGER_HIDE } from '../constants/messenger';


export const show = () => ({
  type: MESSENGER_SHOW,
});

export const hide = () => ({
  type: MESSENGER_HIDE,
});
