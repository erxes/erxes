const commonParams = `
  $name: String,
  $description: String,
  $branchIds: [String],
  $kbCategoryId: String,
  $status: String`;
const commonParamsDef = `
  name: $name,
  description: $description,
  branchIds: $branchIds,
  kbCategoryId: $kbCategoryId,
  status: $status`;

const commonField = `
    _id
    name
    description
    kbCategoryId
    status
    createdAt
`;

const addSafetyTips = `
mutation AddSafetyTip(${commonParams}) {
  addSafetyTip(${commonParamsDef}) {
    ${commonField}
  }
}

`;

const updateSafetyTips = `
    mutation UpdateSafetyTip($_id: String,${commonParams}) {
      updateSafetyTip(_id: $_id,${commonParamsDef}) {
        ${commonField}
      }
    }
`;

const removeSafetyTips = `
    mutation RemoveSafetyTip($_id: String) {
      removeSafetyTip(_id: $_id) {
        ${commonField}
      }
    }
`;

export default { addSafetyTips, updateSafetyTips, removeSafetyTips };
