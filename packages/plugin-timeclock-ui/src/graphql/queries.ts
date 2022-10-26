const list = `
  query listQuery($startDate: String, $endDate: String, $userId: String) {
    timeclocks(startDate: $startDate, endDate: $endDate, userId: $userId) {
      _id
      shiftStart
      shiftEnd
  }
}
`;

export default {
  list
};
