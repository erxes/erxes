const users = `
  query users {
    users {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

const brands = `
  query brands {
    brands {
      _id
      name
      code
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      name
      brandId
      languageCode
      messengerData
      uiOptions
    }
  }
`;

export default {
  users,
  brands,
  integrationDetail
};
