const commonParams = `
  $name: String,
  $branchIds: [String],
  $kbCategoryIds: [String],
  $sortDirection: Int`;

const commonParamsDef = `
  name: $name,
  branchIds: $branchIds,
  kbCategoryIds: $kbCategoryIds,
  sortDirection: $sortDirection`;

const safetyTips = `
  query SafetyTips(${commonParams}) {
    safetyTips(${commonParamsDef}) {
      _id
      name
      description
      branchIds
      kbCategoryId
      status
      createdAt

      branches
      kbCategory
    }
  }
`;

const safetyTipsTotalCount = `
  query SafetyTipsTotalCount(${commonParams}) {
    safetyTipsTotalCount(${commonParamsDef})
  }
`;

export default {
  safetyTips,
  safetyTipsTotalCount
};
