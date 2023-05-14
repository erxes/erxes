const companies = `
  query Companies($searchValue: String) {
    companies(searchValue: $searchValue) {
      _id
      avatar
      primaryName
      primaryEmail
      primaryPhone
    }
  }
`;

const customers = `
  query Customers($searchValue: String) {
    customers(searchValue: $searchValue) {
      _id
      avatar
      firstName
      lastName
      primaryEmail
      primaryPhone
    }
  }
`;

export default {
  companies,
  customers
};
