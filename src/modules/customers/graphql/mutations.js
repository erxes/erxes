const customersAdd = `
  mutation customersAdd($name: String, $email: String) {
    customersAdd(name: $name, email: $email) {
      _id
    }
  }
`;

const customersEdit = `
  mutation customersEdit(
    $_id: String!,
    $name: String,
    $email: String,
    $phone: String,
    $customFieldsData: JSON
  ) {

    customersEdit(
      _id: $_id,
      name: $name,
      email: $email,
      phone: $phone,
      customFieldsData: $customFieldsData
    ) {

      name
      email
      phone
    }
  }
`;

const customersAddCompany = `
  mutation customersAddCompany($_id: String!, $name: String!, $website: String) {
    customersAddCompany(_id: $_id, name: $name, website: $website) {
      _id
    }
  }
`;

export default {
  customersAdd,
  customersEdit,
  customersAddCompany
};
