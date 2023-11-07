const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String, $direction: String, $callID: String!) {
    callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone, direction: $direction, callID: $callID) {
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
