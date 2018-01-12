const companiesAdd = `
  mutation companiesAdd($name: String!, $website: String) {
    companiesAdd(name: $name, website: $website) {
      _id
    }
  }
`;

const companiesEdit = `
  mutation companiesEdit(
    $_id: String!,
    $name: String!,
    $size: Int,
    $industry: String,
    $website: String,
    $plan: String,
    $customFieldsData: JSON
    $tagIds: [String]
  ) {

    companiesEdit(
      _id: $_id,
      name: $name,
      size: $size,
      industry: $industry,
      website: $website,
      plan: $plan,
      tagIds: $tagIds,
      customFieldsData: $customFieldsData
    ) {
      name
    }
  }
`;

const companiesAddCustomer = `
  mutation companiesAddCustomer($_id: String!, $name: String!, $email: String) {
    companiesAddCustomer(_id: $_id, name: $name, email: $email) {
      _id
    }
  }
`;

const companiesEditCustomers = `
  mutation companiesEditCustomers($_id: String!, $customerIds: [String]) {
    companiesEditCustomers(_id: $_id, customerIds: $customerIds) {
      _id
    }
  }
`;

const companiesRemove = `
  mutation companiesRemove($companyIds: [String]) {
    companiesRemove(companyIds: $companyIds)
  }
`;

export default {
  companiesAdd,
  companiesEdit,
  companiesAddCustomer,
  companiesEditCustomers,
  companiesRemove
};
