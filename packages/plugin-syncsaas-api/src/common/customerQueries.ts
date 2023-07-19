const params = `
    $state: String,
    $avatar: String,
    $firstName: String,
    $lastName: String,
    $middleName: String,
    $primaryEmail: String,
    $emails: [String],
    $primaryPhone: String,
    $phones: [String],
    $primaryAddress: JSON,
    $addresses: [JSON],
    $position: String,
    $leadStatus: String,
    $description: String,
    $isSubscribed: String,
    $links: JSON,
    $sex: Int,
    $birthDate: Date
`;

const parmasDef = `
    state: $state,
    avatar: $avatar,
    firstName: $firstName,
    lastName: $lastName,
    middleName: $middleName,
    primaryEmail: $primaryEmail,
    emails: $emails,
    primaryPhone: $primaryPhone,
    phones: $phones,
    primaryAddress: $primaryAddress,
    addresses: $addresses,
    position: $position,
    leadStatus: $leadStatus,
    description: $description,
    isSubscribed: $isSubscribed,
    links: $links,
    sex: $sex,
    birthDate: $birthDate
`;

const customersAdd = `
mutation CustomersAdd(${params}) {
  customersAdd(${parmasDef}) {
    _id
    email
  }
}
`;

const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      _id
    }
  }
`;

export { customersAdd, customerDetail };
