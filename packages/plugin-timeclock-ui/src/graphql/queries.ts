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

const attachmentFields = `
  url
  name
  type
  size
  duration
`;

const list = `
  query listTimeclocksQuery($startDate: Date, $endDate: Date, $userIds: [String], $branchIds: [String], $departmentIds: [String]) {
    timeclocks(startDate: $startDate, endDate: $endDate, userIds: $userIds, branchIds: $branchIds, departmentIds: $departmentIds) {
      _id
      shiftStart
      shiftEnd
      shiftActive
      user {
        ${userFields}
      }
      employeeUserName
      branchName
      employeeId
      deviceName
      deviceType
  }
}
`;

const listAbsence = `
query listAbsenceQuery($startDate: Date, $endDate: Date, $userIds: [String], $branchIds: [String], $departmentIds: [String]){
  absences(startDate: $startDate, endDate: $endDate, userIds: $userIds, branchIds: $branchIds, departmentIds: $departmentIds) {
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
    attachment{
      ${attachmentFields}
    }
  }
}`;

const listSchedule = `
query listScheduleQuery($startDate: Date, $endDate: Date, $userIds: [String], $branchIds: [String], $departmentIds: [String]){
  schedules(startDate: $startDate, endDate: $endDate, userIds: $userIds, branchIds: $branchIds, departmentIds: $departmentIds) {
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
        totalMinsScheduled
      }
      groupTotalMinsLate
      groupTotalAbsenceMins
      groupTotalMinsWorked
      groupTotalMinsScheduled
    }
  }`;

const listReportByUser = `
  query timeclockReportByUser($selectedUser: String){
    timeclockReportByUser(selectedUser:$selectedUser){
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
  }`;

const listAbsenceTypes = `
  query absenceTypes{
    absenceTypes{
      _id
      name
      explRequired
      attachRequired
    }
  }
`;

const listPayDates = `
  query payDates{
    payDates{
      _id
      payDates
    } 
  }
`;

const listHolidays = `
query holidays {
  holidays {
    _id
    holidayName
    startTime
    endTime
  }
}`;
export default {
  listReports,
  listReportByUser,
  listSchedule,
  listBranches,
  list,
  listAbsence,
  listAbsenceTypes,
  listPayDates,
  listHolidays
};
