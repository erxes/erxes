const customer = (state, action) => {
  let newState = {};

  switch (action.type) {
    case 'CUSTOMER_RECEIVED':
      return {
        _id: action._id,
        name: action.name,
        email: action.email,
      };

    case 'CUSTOMER_CHANGED':
      newState = Object.assign(state, action.fields);

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
    case 'CUSTOMER_RECEIVED':
      old = state.findIndex(s => s._id === action._id);
      if (old === -1) {
        return [
          ...state,
          customer(state, action),
        ];
      }

      state.splice(old, 1, customer(state[old], action));
      return [...state];

    case 'CUSTOMER_CHANGED':
      old = state.findIndex(s => s._id === action._id);
      if (old !== -1) {
        state.splice(old, 1, customer(state[old], action));
      }

      return [...state];

    case 'CUSTOMER_READ_MESSAGES':
      old = state.findIndex(s => s.email === action.email);
      if (old === -1) {
        return state;
      }

      state.splice(old, 1, customer(state[old], action));
      return [...state];

    default:
      return state;
  }
};
