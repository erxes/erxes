const commonFields = `
  $code: String,
  $name: String,
  $description: String,

  $companyId: String,
  $percent: Float,
  $yearPercents: String,
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  companyId: $companyId,
  percent: $percent,
  yearPercents: $yearPercents,
`;

const insuranceTypesAdd = `
  mutation insuranceTypesAdd(${commonFields}) {
    insuranceTypesAdd(${commonVariables}) {
      _id
      name
      description,
      percent,
      yearPercents,
      company {
        code
        primaryName
      }
    }
  }
`;

const insuranceTypesEdit = `
  mutation insuranceTypesEdit($_id: String!, ${commonFields}) {
    insuranceTypesEdit(_id: $_id, ${commonVariables}) {
      _id
      name,
      description,
      percent,
      yearPercents,
      company {
        code
        primaryName
      }
    }
  }
`;

const insuranceTypesRemove = `
  mutation insuranceTypesRemove($insuranceTypeIds: [String]) {
    insuranceTypesRemove(insuranceTypeIds: $insuranceTypeIds)
  }
`;

export default {
  insuranceTypesAdd,
  insuranceTypesEdit,
  insuranceTypesRemove
};
