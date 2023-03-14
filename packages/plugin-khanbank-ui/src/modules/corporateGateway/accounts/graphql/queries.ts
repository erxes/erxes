const commonFields = `
number
type
currency
status
balance
name
holdBalance
availableBalance
openDate
`;

const listQuery = `
query KhanbankAccounts($configId: String!) {
    khanbankAccounts(configId: $configId) {
        ${commonFields}
    }
  }
`;

const detailQuery = `
query KhanbankAccountDetail($accountNumber: String!, $configId: String!) {
  khanbankAccountDetail(accountNumber: $accountNumber, configId: $configId) {
    ${commonFields}
    homeBranch
    homePhone
    intFrom
    intMethod
    intRate
    intTo
    lastFinancialTranDate
    
    holderInfo(accountNumber: $accountNumber, configId: $configId) {
      custLastName
      custFirstName
    }
  }
}
`;

export default {
  listQuery,
  detailQuery
};
