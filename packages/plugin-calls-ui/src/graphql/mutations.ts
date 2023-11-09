const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String, $direction: String, $callID: String!) {
    callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone, direction: $direction, callID: $callID) {
      conversation {
          _id
          erxesApiId
          integrationId
          senderPhoneNumber
          recipientPhoneNumber
          callId
        }
      customer {
        _id
        avatar
        code
        createdAt
        getTags {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
          totalObjectCount
          parentId
          order
          relatedIds
        }
        email
        primaryPhone
        tagIds
        lastName
        firstName
      }
  }
}
`;

export default {
  callsIntegrationUpdate,
  customersAdd
};
