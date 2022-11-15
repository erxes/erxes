const commonContactInfoTypes = `

    phoneNumber: String
    email: String
    links: JSON
    coordinate: Coordinate
    image: Attachment
`;

export const types = `  
    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    type Branch @key(fields: "_id") @cacheControl(maxAge: 3){
      _id: String!
      title: String
      parentId: String
      supervisorId: String
      supervisor: User
      code: String
      users: [User]
      userIds: [String]
      parent: Branch
      children: [Branch]

      address: String
      radius: Int
      ${commonContactInfoTypes}
  }

  type Timeclock {
    _id: String!
    user: User
    shiftStart: Date
    shiftEnd: Date
  }

  type Absence {
    _id: String!
    user: User
    startTime: Date
    endTime: Date
    reason: String
    explanation: String
    solved: Boolean
    status: String
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

  type Report {
    user: User
    schedule: [Schedule]
    abence: [Absence]
    recordedShift: [Timeclock]
  }
`;
export const queries = `
  timeclocks(startDate: Date, endDate: Date, userId: String): [Timeclock]
  absences(startDate: Date, endDate: Date, userId: String): [Absence]
  timeclockReports(departmentId: String, branchId: String): [Report]
  schedules(startDate: Date, endDate: Date, userId: String): [Schedule]
  
  branches(searchValue: String): [Branch]
  
  timeclockDetail(_id: String!): Timeclock
  absenceDetail(_id: String!): Absence
  scheduleDetail(_id: String!): Schedule
`;

const params = `
  time: Date
  userId: String
  _id: String
`;

const absence_params = `
    userId: String
    startTime: Date
    endTime: Date
    reason: String
    explanation: String
`;

const schedule_params = `
    userId: String
    shifts: [ShiftsRequestInput]
  `;

export const mutations = `
  timeclockStart(${params}): Timeclock
  timeclockStop(${params}): Timeclock
  timeclockRemove(_id : String): Timeclock
  sendAbsenceRequest(${absence_params}): Absence
  sendScheduleRequest(${schedule_params}): Schedule
  submitShift(userIds: [String], shifts:[ShiftsRequestInput]): Schedule
  solveAbsenceRequest(_id: String, status: String): Absence
  solveScheduleRequest(_id: String, status: String): Schedule
  solveShiftRequest(_id: String, status: String): ShiftsRequest
`;
