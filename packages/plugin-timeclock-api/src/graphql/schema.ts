export const types = `  
  extend type User @key(fields: "_id") {
    _id: String! @external
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
  }
`;
export const queries = `
  timeclocks(startDate: Date, endDate: Date, userId: String): [Timeclock]
  absences(startDate: Date, endDate: Date, userId: String): [Absence]
  timeclockDetail(_id: String!): Timeclock
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

export const mutations = `
  timeclockStart(${params}): Timeclock
  timeclockStop(${params}): Timeclock
  timeclockRemove(_id : String): Timeclock
  sendAbsenceRequest(${absence_params}): Absence
`;
