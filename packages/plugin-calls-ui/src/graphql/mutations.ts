const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String) {
      callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone){
      primaryPhone
    }
  }
`;

export default {
  callsIntegrationUpdate,
  customersAdd
};
