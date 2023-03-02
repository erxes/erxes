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
  bichilTimeclockReports(${queryParams}): BichilReportsListResponse
`;

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
    
  `;
};

export default typeDefs;
