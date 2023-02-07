import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `  
  ${attachmentType}
  ${attachmentInput}
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Timeclock {
    _id: String!
    user: User
    shiftStart: Date
    shiftEnd: Date
    shiftActive: Boolean
    employeeUserName: String
    branchName: String
    deviceName: String
    employeeId: String
    deviceType: String
  }

  type Absence {
    _id: String!
    user: User
    holidayName: String
    startTime: Date
    endTime: Date
    reason: String
    explanation: String
    solved: Boolean
    status: String
    attachment: Attachment
  }

  type AbsenceType {
    _id: String!
    name: String
    explRequired: Boolean
    attachRequired: Boolean
    shiftRequest: Boolean
  }

  
  input ShiftsRequestInput {
    _id: String
    overnightShift: Boolean
    configName: String
    shiftStart: Date
    shiftEnd: Date
  }

  type ShiftsRequest{
    _id: String
    shiftStart: Date
    shiftEnd: Date
    solved: Boolean
    status: String
    scheduleId: String
  }

  type Schedule {
    _id: String!
    user: User
    shifts: [ShiftsRequest]
    solved: Boolean
    status: String
    scheduleConfigId: String
  }

  type ScheduleReport{
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

  type UserReport{
    user: User
    scheduleReport: [ScheduleReport]
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

  
  type Report {
    groupTitle: String
    groupReport: [UserReport]
    groupTotalMinsLate: Int
    groupTotalAbsenceMins: Int
    groupTotalMinsWorked: Int
    groupTotalMinsScheduled: Int
  }

  type PayDate {
    _id: String
    payDates: [Int]
  }

  
  type ScheduleConfig {
    _id: String!
    scheduleName: String
    shiftStart: String
    shiftEnd: String
    configDays: [ConfigDay]
  }

  type ConfigDay {
    _id: String!
    configName: String
    overnightShift: Boolean
    scheduleConfigId: String
    configShiftStart: String
    configShiftEnd: String
  }

  type TimeClocksListResponse {
    list: [Timeclock]
    totalCount: Float
  }
  
  type SchedulesListResponse {
    list: [Schedule]
    totalCount: Float
  }
  
  type RequestsListResponse {
    list: [Absence]
    totalCount: Float
  }

  type ReportsListResponse {
    list: [Report]
    totalCount: Float
  }
  
`;

const params = `
  userId: String
  _id: String
  longitude: Float
  latitude: Float
  deviceType: String
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

const absence_params = `
    userId: String
    startTime: Date
    endTime: Date
    reason: String
    explanation: String
    attachment: AttachmentInput
    absenceTypeId: String
`;

const absenceType_params = `
    name: String
    explRequired: Boolean
    attachRequired: Boolean
    shiftRequest: Boolean
`;

export const queries = `
  timeclocksMain(${queryParams}): TimeClocksListResponse
  schedulesMain(${queryParams}): SchedulesListResponse
  requestsMain(${queryParams}): RequestsListResponse

  absenceTypes:[AbsenceType]
  timeclockReports(${queryParams}): ReportsListResponse
  timeclockReportByUser(selectedUser: String): UserReport
  timeclockDetail(_id: String!): Timeclock
  absenceDetail(_id: String!): Absence
  scheduleDetail(_id: String!): Schedule
  scheduleConfigs: [ScheduleConfig]
  payDates: [PayDate]
  holidays: [Absence]
`;

export const mutations = `
  timeclockStart(${params}): Timeclock
  timeclockStop(${params}): Timeclock
  timeclockRemove(_id : String): Timeclock
  absenceTypeRemove(_id: String): JSON
  absenceTypeAdd(${absenceType_params}): AbsenceType
  absenceTypeEdit(_id: String, ${absenceType_params}): AbsenceType
  sendAbsenceRequest(${absence_params}): Absence
  sendScheduleRequest(userId: String, shifts: [ShiftsRequestInput], scheduleConfigId: String): Schedule
  submitSchedule(branchIds:[String],departmentIds:[String], userIds: [String], shifts:[ShiftsRequestInput], scheduleConfigId: String): Schedule
  solveAbsenceRequest(_id: String, status: String): Absence
  solveScheduleRequest(_id: String, status: String): Schedule
  solveShiftRequest(_id: String, status: String): ShiftsRequest
  scheduleConfigAdd(scheduleName: String, scheduleConfig: [ShiftsRequestInput], configShiftStart: String, configShiftEnd: String): ScheduleConfig
  scheduleConfigEdit(_id : String ,scheduleName: String, scheduleConfig: [ShiftsRequestInput], configShiftStart: String, configShiftEnd: String): ScheduleConfig
  scheduleConfigRemove(_id : String ): JSON
  payDateAdd(dateNums: [Int]): PayDate
  payDateEdit(_id: String, dateNums: [Int]): PayDate
  payDateRemove(_id: String): JSON
  holidayAdd(name: String, startDate: Date, endDate: Date): Absence
  holidayEdit(_id: String, name: String, startDate: Date, endDate: Date): Absence
  holidayRemove(_id: String): JSON
  scheduleRemove(_id: String): JSON
  scheduleShiftRemove(_id: String): JSON
  extractAllDataFromMySQL(startDate: String, endDate: String): [Timeclock]
`;
