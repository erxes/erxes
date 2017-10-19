const striped = (state = false, action) => {
  switch (action.type) {
    case "striped-on":
      return true;
    case "striped-off":
      return false;
    default:
      return state;
  }
};
export default striped;
