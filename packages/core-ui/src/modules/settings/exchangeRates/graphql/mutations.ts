const commonParamsDef = `
  $date: Date
  $mainCurrency: String
  $rateCurrency: String
  $rate: Float
`;

const commonParams = `
  date: $date
  mainCurrency: $mainCurrency
  rateCurrency: $rateCurrency
  rate: $rate
`;

const exchangeRateAdd = `
  mutation exchangeRateAdd(${commonParamsDef}) {
    exchangeRateAdd(${commonParams}) {
      _id
    }
  }
`;

const exchangeRateEdit = `
  mutation exchangeRateEdit($_id: String!, ${commonParamsDef}) {
    exchangeRateEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const exchangeRateRemove = `
  mutation exchangeRatesRemove($rateIds: [String!]) {
    exchangeRatesRemove(rateIds: $rateIds)
  }
`;

export default {
  exchangeRateAdd,
  exchangeRateEdit,
  exchangeRateRemove,
};
