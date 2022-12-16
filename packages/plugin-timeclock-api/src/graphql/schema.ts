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
  }

  
  input ShiftsRequestInput {
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
  }

  type ScheduleReport{
    date: String
    scheduleStart: Date
    scheduleEnd: Date
    recordedStart: Date
    recordedEnd: Date
    minsLate: Int
    minsWorked: Int
    minsScheduled: Int
  }

  type UserReport{
    user: User
    scheduleReport: [ScheduleReport]
    totalMinsLate: Int
    totalAbsenceMins: Int
    totalMinsWorked: Int
    totalMinsWorkedToday: Int
    totalMinsWorkedThisMonth: Int
    totalMinsScheduled: Int
    totalMinsScheduledToday: Int
    totalMinsScheduledThisMonth: Int
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

`;

export const queries = `
  timeclocks(startDate: Date, endDate: Date, userIds: [String]): [Timeclock]
  absences(startDate: Date, endDate: Date, userId: String): [Absence]
  absenceTypes:[AbsenceType]
  timeclockReports(departmentIds: [String], branchIds: [String], userIds: [String]): [Report]
  timeclockReportByUser(selectedUser: String): UserReport
  schedules(startDate: Date, endDate: Date, userId: String): [Schedule]
  timeclockDetail(_id: String!): Timeclock
  absenceDetail(_id: String!): Absence
  scheduleDetail(_id: String!): Schedule
  payDates: [PayDate]
  holidays: [Absence]
`;

const params = `
  userId: String
  _id: String
  longitude: Float
  latitude: Float
`;

const absence_params = `
    userId: String
    startTime: Date
    endTime: Date
    reason: String
    explanation: String
    attachment: AttachmentInput
`;

const absenceType_params = `
    name: String
    explRequired: Boolean
    attachRequired: Boolean
`;

const schedule_params = `
    userId: String
    shifts: [ShiftsRequestInput]
  `;

export const mutations = `
  timeclockStart(${params}): Timeclock
  timeclockStop(${params}): Timeclock
  timeclockRemove(_id : String): Timeclock
  absenceTypeRemove(_id: String): JSON
  absenceTypeAdd(${absenceType_params}): AbsenceType
  absenceTypeEdit(_id: String, ${absenceType_params}): AbsenceType
  sendAbsenceRequest(${absence_params}): Absence
  sendScheduleRequest(${schedule_params}): Schedule
  submitShift(userIds: [String], shifts:[ShiftsRequestInput]): Schedule
  solveAbsenceRequest(_id: String, status: String): Absence
  solveScheduleRequest(_id: String, status: String): Schedule
  solveShiftRequest(_id: String, status: String): ShiftsRequest
  payDateAdd(dateNums: [Int]): PayDate
  payDateEdit(_id: String, dateNums: [Int]): PayDate
  payDateRemove(_id: String): JSON
  holidayAdd(name: String, startDate: Date, endDate: Date): Absence
  holidayEdit(_id: String, name: String, startDate: Date, endDate: Date): Absence
  holidayRemove(_id: String): JSON
`;
