import { gql } from 'apollo-server-express';

const types = `


  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type BichilReport {
    groupTitle: String
    groupReport: [BichilUserReport]
    groupTotalMinsLate: Int
    groupTotalAbsenceMins: Int
    groupTotalMinsWorked: Int
    groupTotalMinsScheduled: Int
  }

  type BichilUserReport{
    user: User
    scheduleReport: [BichilScheduleReport]

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
  }

  type BichilSalaryReport {
    _id: String
    employeeId: String
    employee: User
    title: String
    
    totalWorkHours: Float
    totalWorkedHours: Float
    mainSalary: Float
    bonus: Float
    addition: Float
    appointment: Float
    kpi: Float
    vacation: Float
    totalAddition: Float
    lateHoursDeduction: Float
    resultDeduction: Float
    totalDeduction: Float
    totalSalary: Float
    preliminarySalary: Float
    receivable: Float
    ndsh: Float
    hhoat: Float
    mainDeduction: Float
    biSan: Float
    phoneCharge: Float
    taxReceivable: Float
    salaryOnHand: Float
  }

  type BichilSalaryReportsListResponse {
    list: [BichilSalaryReport]
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
`;

const queries = `
  bichilTimeclockReport(${queryParams}): BichilReportsListResponse

  bichilSalaryReport(page: Int, perPage: Int, employeeId: String): BichilSalaryReportsListResponse

  bichilSalaryByEmployee(password: String!): BichilSalaryReportsListResponse

  bichilSalaryLabels: JSON
  bichilSalarySymbols: JSON
`;

const mutations = `
finishUnfinishedShifts: JSON`;

const typeDefs = async _serviceDiscovery => {
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
