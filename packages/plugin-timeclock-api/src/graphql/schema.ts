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
  
  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  type Timeclock {
    _id: String!
    user: User
    shiftStart: Date
    shiftEnd: Date
    shiftActive: Boolean
    employeeUserName: String
    deviceName: String
    branchName: String
    employeeId: String
    deviceType: String

    inDevice: String
    outDevice: String

    inDeviceType: String
    outDeviceType: String

  }

  type Timelog {
    _id: String!
    user: User
    timelog: Date
    deviceSerialNo: String
    deviceName: String
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
    
    absenceTimeType: String
    requestDates: [String]
    totalHoursOfAbsence: String
  }

  type AbsenceType {
    _id: String!
    name: String
    explRequired: Boolean
    attachRequired: Boolean
    shiftRequest: Boolean

    requestType: String
    requestTimeType: String
    requestHoursPerDay: Float
  }

  
  input ShiftInput {
    _id: String
    scheduleConfigId: String
    overnightShift: Boolean
    configName: String
    shiftStart: Date
    shiftEnd: Date
    lunchBreakInMins: Int
  }

  type Shift{
    _id: String
    scheduleConfigId: String
    shiftStart: Date
    shiftEnd: Date
    solved: Boolean
    status: String
    scheduleId: String
    lunchBreakInMins: Int
  }

  type Schedule {
    _id: String!
    user: User
    shifts: [Shift]
    solved: Boolean
    status: String
    scheduleConfigId: String
    scheduleChecked: Boolean
    submittedByAdmin: Boolean
    totalBreakInMins: Int
  }
  
  type DuplicateSchedule {
    _id: String!
    user: User
    solved: Boolean
    shifts: [Shift]
  }

  type IUserAbsenceInfo{ 
    totalHoursShiftRequest: Float
    totalHoursWorkedAbroad: Float
    totalHoursPaidAbsence: Float
    totalHoursUnpaidAbsence: Float
    totalHoursSick: Float
  }

  type ScheduleReport{
    timeclockDate: String
    timeclockStart: Date
    timeclockEnd: Date
    timeclockDuration: String

    deviceName: String
    deviceType: String

    inDevice: String
    inDeviceType: String
    outDevice: String
    outDeviceType: String

    scheduledStart: Date
    scheduledEnd: Date
    scheduledDuration:String
    
    lunchBreakInHrs: String
    
    totalMinsLate: String
    totalHoursOvertime: String
    totalHoursOvernight: String
  }

  type UserReport{
    user: User
    scheduleReport: [ScheduleReport]
    
    branchTitles: [String]
    departmentTitles: [String]

    totalMinsLate: Float
    totalAbsenceMins: Int
    totalMinsWorked: Int
    totalRegularHoursWorked: Float
    totalHoursWorked: Float
    totalDaysWorked:Int
    
    totalMinsScheduled: Int
    totalHoursScheduled: Float
    totalDaysScheduled: Int
    
    totalHoursOvertime: Float
    totalHoursOvernight: Float

    absenceInfo: IUserAbsenceInfo

    scheduledShifts: [Shift]
    timeclocks: [Timeclock]
    
    totalHoursWorkedSelectedDay: Float
    totalHoursScheduledSelectedDay: Float
    totalMinsLateSelectedDay: Float
    
    totalHoursWorkedSelectedMonth: Float
    totalDaysWorkedSelectedMonth: Int
    totalHoursScheduledSelectedMonth: Float
    totalDaysScheduledSelectedMonth:Int
    totalMinsLateSelectedMonth: Float
    
    totalHoursWorkedOutsideSchedule: Float
    totalDaysWorkedOutsideSchedule: Int
    
    totalHoursNotWorked: Float
    totalDaysNotWorked: Int

    totalHoursBreakTaken: Float
    totalHoursBreakScheduled: Float
    totalHoursBreakSelecteDay:Float
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
    lunchBreakInMins: Int
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

  type DeviceConfig{
    _id: String!
    deviceName: String
    serialNo: String
    extractRequired: Boolean
  }

  type CheckReport{
    _id: String!
    userId: String
    startDate: String
    endDate: String
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
  
  type TimelogListResponse {
    list: [Timelog]
    totalCount: Float
  }

  type DeviceConfigsListResponse {
    list: [DeviceConfig]
    totalCount: Float
  }
`;

const timeclockParams = `
  userId: String
  _id: String
  longitude: Float
  latitude: Float
  deviceType: String
  inDevice: String
  inDeviceType: String
  outDevice: String
  outDeviceType: String
  shiftStart: Date
  shiftEnd: Date
  shiftActive: Boolean
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
  scheduleStatus: String
  isCurrentUserAdmin: Boolean
`;

const commonParams = `
    ids: [String]
    excludeIds: Boolean
    perPage: Int
    page: Int
    searchValue: String,
    status: String,
`;

const absence_params = `
    userId: String
    startTime: Date
    endTime: Date
    requestDates: [String]
    reason: String
    explanation: String
    attachment: AttachmentInput
    
    absenceTypeId: String
    absenceTimeType: String
    totalHoursOfAbsence: String
`;

const absenceType_params = `
    name: String
    explRequired: Boolean
    attachRequired: Boolean
    shiftRequest: Boolean

    requestType: String
    requestTimeType: String
    requestHoursPerDay: Float
  
`;

export const queries = `
  timeclocksMain(${queryParams}): TimeClocksListResponse
  schedulesMain(${queryParams}): SchedulesListResponse
  requestsMain(${queryParams}): RequestsListResponse
  
  timeclockBranches(${commonParams}):[Branch]
  timeclockDepartments(${commonParams}):[Department]

  timeclocksPerUser(userId: String, shiftActive: Boolean, startDate: String, endDate:String): [Timeclock]
  schedulesPerUser(userId: String, startDate: String, endDate: String): [Schedule]

  
  absenceTypes:[AbsenceType]
  
  timeclockReports(${queryParams}): ReportsListResponse

  
  timeclockReportByUser(selectedUser: String, selectedMonth: String, selectedYear: String, selectedDate:String): UserReport
  
  
  timeclockDetail(_id: String!): Timeclock
  
  timeclockActivePerUser(userId: String): Timeclock

  absenceDetail(_id: String!): Absence
  scheduleDetail(_id: String!): Schedule
  scheduleConfigs: [ScheduleConfig]
  
  payDates: [PayDate]
  holidays: [Absence]

  checkedReportsPerUser(userId: String): [CheckReport]
`;

export const mutations = `
  timeclockStart(${timeclockParams}): Timeclock
  timeclockStop(${timeclockParams}): Timeclock
  timeclockRemove(_id : String): JSON
  timeclockCreate(${timeclockParams}): Timeclock
  timeclockEdit(${timeclockParams}): Timeclock
  
  absenceTypeRemove(_id: String): JSON
  absenceTypeAdd(${absenceType_params}): AbsenceType
  absenceTypeEdit(_id: String, ${absenceType_params}): AbsenceType
  
  sendAbsenceRequest(${absence_params}): Absence
  removeAbsenceRequest(_id: String): JSON

  submitCheckInOutRequest(checkType: String,userId: String, checkTime: Date): AbsenceType
  
  sendScheduleRequest(userId: String, shifts: [ShiftInput], scheduleConfigId: String, totalBreakInMins: Int): Schedule
  submitSchedule(branchIds:[String],departmentIds:[String], userIds: [String], shifts:[ShiftInput], scheduleConfigId: String, totalBreakInMins: Int): Schedule
  checkDuplicateScheduleShifts(branchIds:[String],departmentIds:[String], userIds: [String], shifts:[ShiftInput], status: String): [DuplicateSchedule]

  solveAbsenceRequest(_id: String, status: String): Absence
  solveScheduleRequest(_id: String, status: String): Schedule
  solveShiftRequest(_id: String, status: String): Shift
  
  scheduleConfigAdd(scheduleName: String, lunchBreakInMins: Int,  scheduleConfig: [ShiftInput], configShiftStart: String, configShiftEnd: String): ScheduleConfig
  scheduleConfigEdit(_id : String ,scheduleName: String, lunchBreakInMins: Int,  scheduleConfig: [ShiftInput], configShiftStart: String, configShiftEnd: String): ScheduleConfig
  scheduleConfigRemove(_id : String ): JSON
  
  payDateAdd(dateNums: [Int]): PayDate
  payDateEdit(_id: String, dateNums: [Int]): PayDate
  payDateRemove(_id: String): JSON
  
  holidayAdd(name: String, startDate: Date, endDate: Date): Absence
  holidayEdit(_id: String, name: String, startDate: Date, endDate: Date): Absence
  holidayRemove(_id: String): JSON
  
  scheduleRemove(_id: String): JSON
  scheduleShiftRemove(_id: String): JSON
  
  
  checkReport(userId: String, startDate: String, endDate: String): CheckReport
  checkSchedule(scheduleId: String): JSON
`;
