import { gql } from '~/gql';

export const CALL_GET_CONFIGS = gql(`
  query callsGetConfigs {
    callsGetConfigs {
      _id
      code
      value
    }
  }
`);

export const CALL_INTEGRATION_DETAIL = gql(`
  query callsIntegrationDetail($integrationId: String!) {
    callsIntegrationDetail(integrationId: $integrationId) {
      _id
      inboxId
      phone
      wsServer
      operators {
        userId
        gsUsername
        gsPassword
        gsForwardAgent
      }
      queues
      srcTrunk
      dstTrunk
    }
  }
`);

export const CALL_USER_INTEGRATIONS = gql(`
  query callUserIntegrations {
    callUserIntegrations {
      _id
      inboxId
      name
      operators {
        userId
        gsUsername
        gsPassword
        gsForwardAgent
      }
      phone
      wsServer
      queues
      srcTrunk
      dstTrunk
    }
  }
`);

export const CALL_CUSTOMER_DETAIL = gql(`
  query callsCustomerDetail($customerPhone: String) {
    callsCustomerDetail(customerPhone: $customerPhone) {
      _id
      firstName
      lastName
      primaryPhone
      avatar
      phones
      phone
      tagIds
      getTags {
        _id
        name
        colorCode
        type
      }
    }
  }
`);

export const CALL_GET_AGENT_STATUS = gql(`
  query callGetAgentStatus {
    callGetAgentStatus
  }
`);

export const CALL_QUEUE_INITIAL_LIST = gql(`
  query callQueueInitialList($queue: String!) {
    callQueueInitialList(queue: $queue)
  }
`);
