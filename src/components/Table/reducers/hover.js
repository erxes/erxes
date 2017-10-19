const hover = (state = false, action) => {
  switch (action.type) {
    case "hover-on":
      return true;
    case "hover-off":
      return false;
    default:
      return state;
  }
};
export default hover;
