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

const bichilTimeclockReport = `
  query bichilTimeclockReport(${listParamsDef}){
    bichilTimeclockReport(${listParamsValue}){
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

            totalDays
            totalWeekendDays
            totalHoursShiftRequest
            
        }
        groupTotalMinsLate
        groupTotalAbsenceMins
        groupTotalMinsWorked
        groupTotalMinsScheduled
      }
      totalCount  
    }
  
  }`;

const labelsQuery = `
  query bichilSalaryLabels {
    bichilSalaryLabels
  }
`;

const salaryFields = `
_id
employee {
  _id
  details {
    firstName
    lastName
    position
  }
  branches {
    _id
    title
  }
}
      employeeId 
totalWorkHours 
totalWorkedHours 
mainSalary 
bonus 
addition 
appointment 
kpi 
vacation 
totalAddition 
lateHoursDeduction 
resultDeduction 
totalDeduction 
totalSalary 
preliminarySalary
receivable 
ndsh 
hhoat 
mainDeduction
biSan
phoneCharge
taxReceivable
salaryOnHand
title
`;

const bichilSalaryReport = `
query BichilSalaryReport($page: Int, $perPage: Int) {
  bichilSalaryReport(page: $page, perPage: $perPage) {
    list {
      ${salaryFields}
    }
    totalCount
  }
}
`;

const salaryByEmployee = `
query BichilSalaryByEmployee($password: String!) {
  bichilSalaryByEmployee(password: $password) {
    list {
      ${salaryFields}
    }
    totalCount
  }
}
`;

export default {
  bichilTimeclockReport,
  labelsQuery,
  bichilSalaryReport,
  salaryByEmployee
};
