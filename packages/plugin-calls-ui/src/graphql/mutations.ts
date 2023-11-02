const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String) {
    callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone) {
      _id
      avatar
      getTags {
        _id
        colorCode
        name
        type
      }
      email
      lastName
      firstName
      phones
      phone
      primaryPhone
  }
}
`;

export default {
  callsIntegrationUpdate,
  customersAdd
};
