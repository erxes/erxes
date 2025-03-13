const configs = `
  query accountingsConfigs {
    accountingsConfigs {
      _id
      code
      value
    }
  }
`;

const configsByCode = `
  query accountingsConfigsByCode($codes: [String]) {
    accountingsConfigsByCode(codes: $codes)
  }
`;

const getRate = `
  query exchangeGetRate ($currency: String, $date: Date) {
    exchangeGetRate (currency: $currency, date: $date) {
      _id
      createdAt
      modifiedAt
      date
      mainCurrency
      rateCurrency
      rate  
    }
  }
`;

export default {
  configs,
  configsByCode,
  getRate
};
