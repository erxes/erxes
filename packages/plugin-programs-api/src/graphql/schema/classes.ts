export const types = () => `
    extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  type Classes {
    _id: String
    programId: String
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
  programClasses(classId: String!, page: Int, perPage: Int): ClassesResponse
`;

const classesCommonParams = `
  name : String
  programId: String!
  dates: [String]
  startTime: Date
  endTime : Date
  limit : Int
  entries : Int
`;

export const mutations = `
  programClassesAdd(${classesCommonParams}): Classes
  attendClass(studentId: String!, classId: String!): Classes
`;
