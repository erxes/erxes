export default (state = {}, action) => {
  let conversationId = '';

  switch (action.type) {
    case 'COUNT_RECEIVED':
      conversationId = action.name.replace('unreadMessagesCount_', '');

      return {
        ...state,
        [conversationId]: action.count,
      };

    default:
      return state;
  }
};
