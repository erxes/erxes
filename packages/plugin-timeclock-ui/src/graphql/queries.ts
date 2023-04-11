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

const timelogsMain = `
  query timelogsMain(${listParamsDef}){
    timelogsMain(${listParamsValue}){
      list{
        _id
        user {
          ${userFields}
        }
        timelog
        deviceName
      }
      totalCount
    }
  }`;

const timeclocksMain = `
  query timeclocksMain(${listParamsDef}) {
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

const timeclocksPerUser = `
  query timeclocksPerUser($userId: String, $startDate: String, $endDate: String){
    timeclocksPerUser(userId: $userId, startDate: $startDate, endDate: $endDate){
      _id
      shiftStart
      shiftEnd
      shiftActive
    }
  }
`;

const schedulesMain = `
  query schedulesMain(${listParamsDef}) {
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
          scheduleChecked
          submittedByAdmin
        }
        totalCount
  }
}
`;
const requestsMain = `
  query requestsMain(${listParamsDef}) {
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

const branches = `
  query branches($searchValue: String){
    branches(searchValue: $searchValue){
      _id
      title
    }
  }
`;

const timeclockReports = `
  query timeclockReports(${listParamsDef}){
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
          
              absenceInfo {
                totalHoursWorkedAbroad
                totalHoursPaidAbsence
                totalHoursUnpaidAbsence
                totalHoursSick
              }

            }
            groupTotalMinsLate
            groupTotalAbsenceMins
            groupTotalMinsWorked
            groupTotalMinsScheduled
          }
          totalCount  
    }
  }`;

const absenceTypes = `
  query absenceTypes{
    absenceTypes{
      _id
      name
      explRequired
      attachRequired
      shiftRequest

      requestType
      requestTimeType
      requestHoursPerDay
    }
  }
`;

const payDates = `
  query payDates{
    payDates{
      _id
      payDates
    } 
  }
`;

const holidays = `
query holidays {
  holidays {
    _id
    holidayName
    startTime
    endTime
  }
}`;

const scheduleConfigs = `
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

const deviceConfigs = `
query deviceConfigs (${listParamsDef}){
  deviceConfigs(${listParamsValue}) {
    list {
      _id 
      deviceName
      serialNo
      extractRequired
    }
    totalCount
  }
}`;

const timeLogsPerUser = `
  query timeLogsPerUser($userId: String, $startDate: String, $endDate: String){
    timeLogsPerUser(userId: $userId, startDate: $startDate, endDate: $endDate){
      _id
      timelog
      deviceSerialNo
    }
  }
`;

export default {
  timeclockReports,
  branches,

  timeclocksMain,
  timeclocksPerUser,

  timelogsMain,
  timeLogsPerUser,

  schedulesMain,
  requestsMain,

  absenceTypes,
  payDates,
  holidays,

  scheduleConfigs,
  deviceConfigs
};
