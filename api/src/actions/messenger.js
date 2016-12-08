import { MESSENGER_TOGGLE, CHANGE_ROUTE } from '../constants/messenger';


export const toggle = () => ({
  type: MESSENGER_TOGGLE,
});

export const changeRoute = route => ({
  type: CHANGE_ROUTE,
  route,
});
