import gql from 'graphql-tag';

const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type SalaryReport {
    _id: String
    employeeId: String
    employee: User
    title: String
    
    totalWorkHours: Float
    totalWorkedHours: Float
    mainSalary: Float
    adequateSalary: Float
    kpi: Float
    onAddition: Float
    otherAddition: Float
    bonus: Float
    vacation: Float
    addition: Float
    totalAddition: Float
    lateHoursDeduction: Float
    resultDeduction: Float
    totalDeduction: Float
    totalSalary: Float
    preliminarySalary: Float
    endSalary: Float
    kpiDeduction: Float
    onDeduction: Float
    bonusDeduction: Float
    vacationDeduction: Float
    ndsh: Float
    hhoat: Float
    mainDeduction: Float
    otherDeduction: Float
    salaryOnHand: Float
    receivable: Float
    biSan: Float
    toSendBank: Float
  }


  type SalaryReportsListResponse{
    list: [SalaryReport]
    totalCount: Int
  }
`;

const queries = `
  salaryReport(page: Int, perPage: Int, employeeId: String): SalaryReportsListResponse
  salaryByEmployee(password: String!): SalaryReportsListResponse

  salaryLabels: JSON
  salarySymbols: JSON
`;

const mutations = `
  removeSalaryReport(_id: String!): JSON
  addSalaryReport: JSON
  `;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
