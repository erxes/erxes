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
  $isCurrentUserAdmin: Boolean
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
  isCurrentUserAdmin: $isCurrentUserAdmin
`;

const bichilTimeclockReport = `
  query bichilTimeclockReport(${listParamsDef}){
    bichilTimeclockReport(${listParamsValue}){
      list {
            groupTitle
            
            groupParentsCount
            groupParentsTitles
            
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

              branchTitles
              departmentTitles
            
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
            
              shiftNotClosedDaysPerUser
              shiftNotClosedFee
              shiftNotClosedDeduction
              latenessFee
              totalMinsLateDeduction
              totalDaysAbsent
              absentFee
              absentDeduction
              totalDeduction
              totalHoursVacation
              totalHoursUnpaidAbsence
              totalHoursSick
            }
        groupTotalMinsLate
        groupTotalAbsenceMins
        groupTotalMinsWorked
        groupTotalMinsScheduled
      }
      totalCount  
      totalHoursScheduled
      totalHoursWorked
      totalShiftNotClosedDeduction
      totalLateMinsDeduction
      totalAbsentDeduction
      totalDeductionPerGroup
    }
  
  }`;

const bichilTimeclockReportByUsers = `
query bichilTimeclockReportByUsers(${listParamsDef}){
  bichilTimeclockReportByUsers(${listParamsValue}){
   list {
      user{
        ${userFields}
      }


      schedules{
          shifts{
            shiftStart
            shiftEnd
          }
      }
      timeclocks
      requests
    }
    totalCount
  }
}`;
const labelsQuery = `
  query bichilSalaryLabels {
    bichilSalaryLabels
  }
`;

const symbmolsQuery = `
query bichilSalarySymbols {
  bichilSalarySymbols
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
      adequateSalary
      kpi
      onAddition
      bonus
      vacation
      addition
      totalAddition
      lateHoursDeduction
      resultDeduction
      totalDeduction
      totalSalary
      preliminarySalary
      kpiDeduction
      onDeduction
      bonusDeduction
      vacationDeduction
      ndsh
      hhoat
      mainDeduction
      salaryOnHand
      receivable
      biSan
      toSendBank
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
  bichilTimeclockReportByUsers,
  bichilTimeclockReport,
  labelsQuery,
  bichilSalaryReport,
  salaryByEmployee,
  symbmolsQuery
};
