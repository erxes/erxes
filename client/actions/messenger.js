import { MESSENGER_TOGGLE, CHANGE_ROUTE, CHANGE_CONVERSATION } from '../constants';

export const toggle = () => ({
  type: MESSENGER_TOGGLE,
});

export const changeRoute = route => ({
  type: CHANGE_ROUTE,
  route,
});

export const changeActiveConversation = conversationId => ({
  type: CHANGE_CONVERSATION,
  conversationId,
});

export const changeConversation = conversationId =>
  (dispatch) => {
    dispatch(changeActiveConversation(conversationId));
  };
