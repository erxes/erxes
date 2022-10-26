export const types = `
  type Timeclock {
    _id: String!
    userId: String
    shiftStart: Date
    shiftEnd: Date
  }
`;
export const queries = `
  timeclocks(startDate: String, endDate: String, userId: String): [Timeclock]
`;

const params = `
  time: Date
  userId: String
  _id: String
`;

export const mutations = `
  timeclockStart(${params}): Timeclock
  timeclockStop(${params}): Timeclock
  timeclockRemove(_id:String ): Timeclock
`;
