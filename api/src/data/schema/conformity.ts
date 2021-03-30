export const types = `
  type Conformity {
    _id: String!
    mainType: String
    mainTypeId: String
    relType: String
    relTypeId: String
  }

  type SuccessResult {
    success: Boolean,
  }
`;

const commonParams = `
  mainType: String
  mainTypeId: String
  relType: String
  relTypeId: String,
  proccessId: String
`;

const commonParamsCreate = `
  mainType: String
  mainTypeId: String
  relType: String
  relTypeIds: [String],
  proccessId: String
`;

export const mutations = `
  conformityAdd(${commonParams}): Conformity
  conformityEdit(${commonParamsCreate}): SuccessResult
`;
