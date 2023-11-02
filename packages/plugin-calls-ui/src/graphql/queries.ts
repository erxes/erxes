const callsIntegrationDetail: string = `
  query callsIntegrationDetail($integrationId: String!) {
    callsIntegrationDetail(integrationId: $integrationId) {
      _id
      phone
      wsServer
      inboxId
      operators
      token
    }
  }
`;

const callIntegrationsOfUser: any = `
  query callIntegrationsOfUser {
    callIntegrationsOfUser {
      _id
      inboxId
      operators
      phone
      wsServer
      token
    }
  }
`;

const callCustomerDetail: string = `
  query callsCustomerDetail($callerNumber: String) {
    callsCustomerDetail(callerNumber: $callerNumber){
      _id
      firstName
      primaryPhone
      phones
      phone
      tagIds
      getTags {
        _id
        name
        type
        colorCode
      }
    }
}
`;
export default {
  callsIntegrationDetail,
  callIntegrationsOfUser,
  callCustomerDetail
};
