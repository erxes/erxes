const user = (state, action) => {
  let newState;

  switch (action.type) {
    case 'USER_RECEIVED':
      return {
        _id: action._id,
        details: action.details,
      };

    case 'USER_CHANGED':
      newState = Object.assign({}, state, action.fields);
      if (action.cleared) {
        for (const k of action.cleared) {
          delete newState[k];
        }
      }
      return { ...newState };

    default:
      return state;
  }
};

export default (state = [], action) => {
  let old;

  switch (action.type) {
    case 'USER_RECEIVED':
      old = state.findIndex(s => s._id === action._id);
      if (old === -1) {
        return [
          ...state,
          user(state, action),
        ];
      }

      state.splice(old, 1, user(state[old], action));
      return [...state];

    case 'USER_CHANGED':
      state.map((s) => {
        if (s._id === action._id) {
          return user(s, action);
        }

        return s;
      });

      return [...state];

    default:
      return state;
  }
};
