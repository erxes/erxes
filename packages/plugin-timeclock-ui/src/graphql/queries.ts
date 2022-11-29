const userFields = `
  _id
  username
  email
  details {
    avatar
    fullName
  }
  department{
    _id
    title
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
      shiftActive
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
  query listReportsQuery($departmentIds: [String], $branchIds: [String]){
    timeclockReports(departmentIds:$departmentIds, branchIds: $branchIds){
      groupTitle
      groupReport{
        user {
          ${userFields}
        }
        scheduleReport {
          date
          scheduleStart
          scheduleEnd
          recordedStart
          recordedEnd
          minsLate
          minsWorked
        }
        totalMinsLate
        totalAbsenceMins
        totalMinsWorked
      }
      groupTotalMinsLate
      groupTotalAbsenceMins
      groupTotalMinsWorked
    }
  }`;

export default {
  listReports,
  listSchedule,
  listBranches,
  list,
  listAbsence
};
