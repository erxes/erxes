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

const accountingAdjustFundRateChanged = `
  subscription AccountingAdjustFundRateChanged($adjustId: String!) {
    accountingAdjustFundRateChanged(adjustId: $adjustId) {
      _id
      createdAt
      createdBy
      updatedAt
      modifiedBy

      date
      mainCurrency
      currency
      description
      spotRate
      gainAccountId
      lossAccountId
      transactionId
    }
  }
`;

const accountingAdjustDebtRateChanged = `
  subscription AccountingAdjustDebtRateChanged($adjustId: String!) {
    accountingAdjustDebtRateChanged(adjustId: $adjustId) {
      _id
      createdAt
      createdBy
      updatedAt
      modifiedBy

      date
      mainCurrency
      currency
      customerType
      customerId
      description
      spotRate
      gainAccountId
      lossAccountId
      transactionId
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
  accountingAdjustFundRateChanged,
  accountingAdjustDebtRateChanged,
};
