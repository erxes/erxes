const userFields = `
  _id
  username
  email
  details {
    avatar
    fullName
  }
`;

const list = `
  query listQuery($startDate: Date, $endDate: Date, $userId: String) {
    timeclocks(startDate: $startDate, endDate: $endDate, userId: $userId) {
      _id
      shiftStart
      shiftEnd
      user {
        ${userFields}
      }
  }
}
`;

const listAbsence = `
query listAbsenceQuery($startDate: Date, $endDate: Date, $userId: String){
  absences(startDate: $startDate, endDate: $endDate, userId: $userId){
    _id
    startTime
    endTime
    reason
    explanation
    solved
    status
    user {
      ${userFields}
    }
  }
}`;

const listSchedule = `
query listAbsenceQuery($startDate: Date, $endDate: Date, $userId: String){
  schedules(startDate: $startDate, endDate: $endDate, userId: $userId){
    _id
    shifts{
      shiftStart
      shiftEnd
    }
    solved
    status
    user {
      ${userFields}
    }
  }
}`;
export default {
  listSchedule,
  list,
  listAbsence
};
