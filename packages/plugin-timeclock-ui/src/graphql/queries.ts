const userFields = `
  _id
  username
  email
  details {
    avatar
    fullName
  }
`;

const absenceFields = `
  _id
  startTime
  endTime
  reason
  solved
`;
const timeclockFields = `
      _id
      shiftStart
      shiftEnd
`;
const scheduleFields = `
    _id
    user{
      ${userFields}
    }
    shifts{
      _id
      shiftStart
      shiftEnd
      solved
      status
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
query listScheduleQuery($startDate: Date, $endDate: Date, $userId: String){
  schedules(startDate: $startDate, endDate: $endDate, userId: $userId){
    _id
    shifts{
      _id
      shiftStart
      shiftEnd
      solved
      status
    }
    solved
    status
    user {
      ${userFields}
    }
  }
}`;

const listBranches = `
  query listBranchesQuery($searchValue: String){
    branches(searchValue: $searchValue){
      _id
      title
    }
  }
`;

const listReports = `
  query listReportsQuery($departmentId: String, $branchId: String){
    timeclockReports(departmentId:$departmentId, branchId: $branchId){
      user {
        ${userFields}
      }
      schedule{
        ${scheduleFields}
      }
      absence{
        ${absenceFields}
      }
      recordedShift{
        ${timeclockFields}
      }
    }
  }`;

export default {
  listReports,
  listSchedule,
  listBranches,
  list,
  listAbsence
};
