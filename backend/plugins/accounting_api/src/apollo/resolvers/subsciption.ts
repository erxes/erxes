const accountingAdjustInventoryChanged = `
  subscription AccountingAdjustInventoryChanged($adjustId: String!) {
    accountingAdjustInventoryChanged(adjustId: $adjustId) {
       _id
      createdAt
      createdBy
      updatedAt
      modifiedBy

      date
      description
      status
      error
      warning
      beginDate
      successDate
      checkedAt
    }
  }
`;

const accountingAdjustFixedAssetChanged = `
  subscription AccountingAdjustFixedAssetChanged($adjustId: String!) {
    accountingAdjustFixedAssetChanged(adjustId: $adjustId) {
      _id
      createdAt
      createdBy
      updatedAt
      modifiedBy

      date
      description
      status
      error
      warning
      beginDate
      successDate
      checkedAt
    }
  }
`;

export default {
  accountingAdjustInventoryChanged,
  accountingAdjustFixedAssetChanged,
};
