export const types = () => `
  type Attendances {
    _id: String
    status: String
    description: String
    classId: String
    createdAt: Date
    updatedAt: Date
  }

  type AttendancesResponse {
    list: [Attendances]
    totalCount: Int
  }
`;

export const queries = `
  attendances(classId: String!, studentId: String): AttendancesResponse
`;

const attendanceCommonParams = `
  studentId: String!
  classId: String!
  status: String
  description: String
`;

export const mutations = `
  markAttendance(${attendanceCommonParams}): Attendances
`;
