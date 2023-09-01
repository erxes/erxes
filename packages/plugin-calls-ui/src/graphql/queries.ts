const callsIntegrationDetail: string = `
  query callsIntegrationDetail($integrationId: String!) {
    callsIntegrationDetail(integrationId: $integrationId) {
      _id
      username
      password
      phone
      wsServer
      operatorIds
    }
  }
`;

export default {
  callsIntegrationDetail
};
