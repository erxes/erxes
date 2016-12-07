import { MESSENGER_SHOW, MESSENGER_HIDE, CHANGE_ROUTE } from '../constants/messenger';


export const show = () => ({
  type: MESSENGER_SHOW,
});

export const hide = () => ({
  type: MESSENGER_HIDE,
});

export const changeRoute = route => ({
  type: CHANGE_ROUTE,
  route,
});
