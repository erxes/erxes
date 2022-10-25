const list = `
  query listQuery($date: String) {
    timeclocks(date: $date) {
      _id
      shiftStart
      shiftEnd
  }
}
`;

export default {
  list
};
