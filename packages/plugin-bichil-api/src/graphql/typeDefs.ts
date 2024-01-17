import gql from 'graphql-tag';
import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

const types = `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  extend type Timeclock @key(fields: "_id") {
    _id: String! @external
  }
  extend type Schedule @key(fields: "_id") {
    _id: String! @external
  }
  extend type Absence @key(fields: "_id") {
    _id: String! @external
  }


  type BichilReport {
    groupTitle: String
    groupReport: [BichilUserReport]
    
    groupParentsCount: Int
    groupParentsTitles: [String]

    groupTotalMinsLate: Int
    groupTotalAbsenceMins: Int
    groupTotalMinsWorked: Int
    groupTotalMinsScheduled: Int
  }

  type BichilUserReport{
    user: User
    scheduleReport: [BichilScheduleReport]

    branchTitles: [String]
    departmentTitles: [String]

    totalDays: Float
    totalWeekendDays: Float
    totalHoursShiftRequest: Float
    
    totalMinsLate: Float
    totalAbsenceMins: Int
    totalMinsWorked: Int
    totalMinsWorkedToday: Int
    totalMinsWorkedThisMonth: Int
    totalRegularHoursWorked: Float
    totalHoursWorked: Float
    totalDaysWorked:Int
    
    totalMinsScheduled: Int
    totalHoursScheduled: Float
    totalDaysScheduled: Int
    totalMinsScheduledToday: Int
    totalMinsScheduledThisMonth: Int
    
    totalHoursOvertime: Float
    totalHoursOvernight: Float

    totalMinsLateToday: Int
    totalMinsLateThisMonth: Int
    totalMinsAbsenceThisMonth: Int

    schedules: [Schedule]
    timeclocks: [JSON]
    requests: [JSON]

    leftWork: String
    paidBonus: String
    paidBonus2: String

    shiftNotClosedDaysPerUser: String
    shiftNotClosedFee: String
    shiftNotClosedDeduction: String
    
    latenessFee: String
    totalMinsLateDeduction: Float
    
    totalDaysAbsent: Int
    absentFee: Int
    absentDeduction: Int

    totalDeduction: Float

    totalHoursVacation : Float
    totalHoursUnpaidAbsence : Float
    totalHoursSick : Float



    totalHoursWorkedSelectedDay: Float
    totalHoursScheduledSelectedDay: Float
    totalMinsLateSelectedDay: Float
    
    totalHoursWorkedSelectedMonth: Float
    totalDaysWorkedSelectedMonth: Int
    totalHoursScheduledSelectedMonth: Float
    totalDaysScheduledSelectedMonth:Int
    totalMinsLateSelectedMonth: Float
    totalDaysAbsentSelectedMonth: Int
    totalHoursRequestsSelectedMonth: Float
  }

  type BichilScheduleReport {
    timeclockDate: String
    timeclockStart: Date
    timeclockEnd: Date
    timeclockDuration: String

    deviceName: String
    deviceType: String

    scheduledStart: Date
    scheduledEnd: Date
    scheduledDuration:String
    
    totalMinsLate: String
    totalHoursOvertime: String
    totalHoursOvernight: String
  }

  
  type BichilReportsListResponse {
    list: [BichilReport]
    totalCount: Float

    totalHoursScheduled: Float
    totalHoursWorked: Float
    totalShiftNotClosedDeduction: Float
    totalLateMinsDeduction: Float
    totalAbsentDeduction: Float
    totalDeductionPerGroup: Float
  }

  type BichilSalaryReport {
    _id: String
    employeeId: String
    employee: User
    title: String
    
    totalWorkHours: Float
    totalWorkedHours: Float
    mainSalary: Float
    adequateSalary: Float
    kpi: Float
    onAddition: Float
    otherAddition: Float
    bonus: Float
    vacation: Float
    addition: Float
    totalAddition: Float
    lateHoursDeduction: Float
    resultDeduction: Float
    totalDeduction: Float
    totalSalary: Float
    preliminarySalary: Float
    endSalary: Float
    kpiDeduction: Float
    onDeduction: Float
    bonusDeduction: Float
    vacationDeduction: Float
    ndsh: Float
    hhoat: Float
    mainDeduction: Float
    otherDeduction: Float
    salaryOnHand: Float
    receivable: Float
    biSan: Float
    toSendBank: Float
  }

  type BichilSalaryReportsListResponse {
    list: [BichilSalaryReport]
    totalCount: Int
  }

  type BichilReportByUsersListResponse {
    list: [BichilUserReport]
    totalCount: Int
  }

`;

const queryParams = `
  page: Int
  perPage: Int
  startDate: Date 
  endDate: Date
  userIds: [String]
  branchIds: [String]
  departmentIds: [String]
  reportType: String
  isCurrentUserAdmin: Boolean
`;

const queries = `
  bichilTimeclockReport(${queryParams}): BichilReportsListResponse
  
  bichilTimeclockReportByUsers(${queryParams}): BichilReportByUsersListResponse

  bichilSalaryReport(page: Int, perPage: Int, employeeId: String): BichilSalaryReportsListResponse

  bichilSalaryByEmployee(password: String!): BichilSalaryReportsListResponse

  bichilTimeclockReportByUser(selectedUser: String, selectedMonth: String, selectedYear: String, selectedDate:String): BichilUserReport

  bichilSalaryLabels: JSON
  bichilSalarySymbols: JSON
`;

const mutations = `
  finishUnfinishedShifts: JSON

  bichilRemoveSalaryReport(_id: String!): JSON
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }

    extend type Mutation { 
      ${mutations}
    }
    
  `;
};

export default typeDefs;
