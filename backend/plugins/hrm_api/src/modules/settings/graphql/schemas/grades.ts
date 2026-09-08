export const types = `
  type HrmGrade {
    _id: String!
    code: String!
    name: String!
    description: String
    rank: Int
    baseSalary: Float
    allowanceAmount: Float
    allowanceRate: Float
    status: String!
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input HrmGradeInput {
    code: String!
    name: String!
    description: String
    rank: Int
    baseSalary: Float
    allowanceAmount: Float
    allowanceRate: Float
    status: String
  }
`;

export const queries = `
  hrmGradeDetail(_id: String!): HrmGrade
  hrmGradeByCode(code: String!): HrmGrade
  hrmGrades(status: String, searchValue: String, page: Int, perPage: Int): [HrmGrade]
  hrmGradesCount(status: String, searchValue: String): Int
`;

export const mutations = `
  hrmGradesCreate(doc: HrmGradeInput!): HrmGrade
  hrmGradesUpdate(_id: String!, doc: HrmGradeInput!): HrmGrade
  hrmGradesArchive(_id: String!): HrmGrade
  hrmGradesRemove(_id: String!): String
`;
