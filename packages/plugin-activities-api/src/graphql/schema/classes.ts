export const types = () => `
    extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  type Classes {
    _id: String
    activityId: String
    students : [Customer]
    dates: [String]
    startTime : Date
    endTime : Date
    limit: Int
    entries: Int
    createdAt: Date
    updatedAt: Date
  }

  type ClassesResponse {
    list: [Classes]
    totalCount: Int
  }
`;

export const queries = `
  activityClasses(classId: String!, page: Int, perPage: Int): ClassesResponse
`;

const classesCommonParams = `
  name : String
  activityId: String!
  dates: [String]
  startTime: Date
  endTime : Date
  limit : Int
  entries : Int
`;

export const mutations = `
  activityClassesAdd(${classesCommonParams}): Classes
  attendClass(studentId: String!, classId: String!): Classes
`;
