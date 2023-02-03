const userFields = `
  _id
  username
  email
  employeeId
  details {
    avatar
    fullName
    firstName
    lastName
    position
  }
  departments {
    title
  }
  branches {
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

const listParamsDef = `
  $page: Int
  $perPage: Int
  $startDate: Date
  $endDate: Date
  $userIds: [String]
  $branchIds: [String]
  $departmentIds: [String]
  $reportType: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  startDate: $startDate
  endDate: $endDate
  userIds: $userIds
  branchIds: $branchIds
  departmentIds: $departmentIds
  reportType: $reportType
`;

const listTimeclocksMain = `
  query listTimeclocksQuery(${listParamsDef}) {
    timeclocksMain(${listParamsValue}) {
      list {
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
        totalCount
  }
}
`;
const listSchedulesMain = `
  query listSchedulesMain(${listParamsDef}) {
    schedulesMain(${listParamsValue}) {
      list {
          _id
          shifts{
            _id
            shiftStart
            shiftEnd
            solved
            status
          }
          scheduleConfigId
          solved
          status
          user {
            ${userFields}
          }
        }
        totalCount
  }
}
`;
const listRequestsMain = `
  query listRequestsMain(${listParamsDef}) {
    requestsMain(${listParamsValue}) {
      list {
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
        totalCount
  }
}
`;

const listBranches = `
  query listBranchesQuery($searchValue: String){
    branches(searchValue: $searchValue){
      _id
      title
    }
  }
`;

const listReports = `
  query listReportsQuery(${listParamsDef}){
    timeclockReports(${listParamsValue}){
      list {
              groupTitle
            groupReport{
              user {
                ${userFields}
              }
              scheduleReport {
                timeclockDate
                timeclockStart
                timeclockEnd
                timeclockDuration
            
                deviceName
                deviceType
            
                scheduledStart
                scheduledEnd
                scheduledDuration
                
                totalMinsLate
                totalHoursOvertime
                totalHoursOvernight
              }
              totalMinsLate
              totalAbsenceMins
              totalMinsWorked
              totalMinsScheduled

              totalRegularHoursWorked
              totalHoursWorked
              totalMinsWorkedThisMonth
              totalDaysWorked

              totalHoursOvertime
              totalHoursOvernight
            
              totalMinsScheduledThisMonth
              totalDaysScheduled
              totalHoursScheduled
            }
            groupTotalMinsLate
            groupTotalAbsenceMins
            groupTotalMinsWorked
            groupTotalMinsScheduled
          }
          totalCount  
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
      shiftRequest
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

const listScheduleConfig = `
  query scheduleConfigs {
    scheduleConfigs{
      _id
      scheduleName
      shiftStart
      shiftEnd
      configDays{
        _id
        configName
        configShiftStart
        configShiftEnd
        overnightShift
      }
    }
  }

`;
export default {
  listReports,
  listReportByUser,
  listBranches,
  listTimeclocksMain,
  listSchedulesMain,
  listRequestsMain,
  listAbsenceTypes,
  listPayDates,
  listHolidays,
  listScheduleConfig
};
