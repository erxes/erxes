const viberIntegrationDetail: string = `
  query viberIntegrationDetail($integrationId: String!) {
    viberIntegrationDetail(integrationId: $integrationId) {
      _id
      token
    }
  }
`;

export default {
  viberIntegrationDetail
};
