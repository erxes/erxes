const commonFields = `
number
type
currency
status
balance
name
holdBalance
availableBalance
`;

const listQuery = `
query KhanbankAccounts($configId: String!) {
    khanbankAccounts(configId: $configId) {
        ${commonFields}
    }
  }
`;

const ratesQuery = `
query KhanbankRates {
  khanbankRates {
    sellRate
    number
    name
    midRate
    currency
    cashSellRate
    cashBuyRate
    buyRate
  }
}
`;

export default {
  listQuery,
  ratesQuery
};
