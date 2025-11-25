const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
    }
  }
`;

const conversationClientMessageInserted = `
  subscription conversationClientMessageInserted($userId: String!) {
    conversationClientMessageInserted(userId: $userId) {
      _id
      content
    }
  }
`;

const conversationClientTypingStatusChanged = `
  subscription conversationClientTypingStatusChanged($_id: String!) {
    conversationClientTypingStatusChanged(_id: $_id) {
      text
    }
  }
`;

const conversationExternalIntegrationMessageInserted = `
  subscription conversationExternalIntegrationMessageInserted {
    conversationExternalIntegrationMessageInserted
  }
`;

const customerConnectionChanged = `
  subscription customerConnectionChanged($_id: String!) {
    customerConnectionChanged(_id: $_id) {
      _id
      status
    }
  }
`;

const callReceived = `
  subscription phoneCallReceived($userId: String) {
    phoneCallReceived(userId: $userId)
  }
`;

const callWaitingReceived = `
  subscription waitingCallReceived($extension: String) {
    waitingCallReceived(extension: $extension)
  }
`;

const callTalkingReceived = `
  subscription talkingCallReceived($extension: String) {
    talkingCallReceived(extension: $extension)
  }
`;

const callAgentReceived = `
  subscription agentCallReceived($extension: String) {
    agentCallReceived(extension: $extension)
  }
`;

const queueRealtimeUpdate = `
  subscription queueRealtimeUpdate($extension: String) {
    queueRealtimeUpdate(extension: $extension)
  }
`;

const ticketPipelineChanged = `
  subscription ticketPipelineChanged($_id: String!) {
    ticketPipelineChanged(_id: $_id) {
      type
      pipeline {
        _id
        name
        description
        order
        channelId
      }
    }
  }
`;

const ticketPipelineListChanged = `
  subscription ticketPipelineListChanged {
    ticketPipelineListChanged {
      type
      pipeline {
        _id
        name
        description
        order
        channelId
      }
    }
  }
`;

const ticketChanged = `
  subscription ticketChanged($_id: String!) {
    ticketChanged(_id: $_id) {
      type
      ticket {
        _id
        name
        channelId
        pipelineId
        statusId
        type
        priority
      }
    }
  }
`;

const ticketListChanged = `
  subscription ticketListChanged {
    ticketListChanged {
      type
      ticket {
        _id
        name
        channelId
        pipelineId
        statusId
        type
        priority
      }
    }
  }
`;

const ticketStatusChanged = `
  subscription ticketStatusChanged($_id: String!) {
    ticketStatusChanged(_id: $_id) {
      type
      status {
        _id
        name
        channelId
        color
        type
        order
      }
    }
  }
`;

const ticketStatusListChanged = `
  subscription ticketStatusListChanged {
    ticketStatusListChanged {
      type
      status {
        _id
        name
        channelId
        color
        type
        order
      }
    }
  }
`;

const ticketActivityChanged = `
  subscription ticketActivityChanged($contentId: String!) {
    ticketActivityChanged(contentId: $contentId) {
      type
      activity {
        _id
        content
        createdAt
        createdBy
      }
    }
  }
`;

export default {
  conversationChanged,
  conversationMessageInserted,
  conversationClientMessageInserted,
  conversationClientTypingStatusChanged,
  conversationExternalIntegrationMessageInserted,
  customerConnectionChanged,
  callReceived,
  callTalkingReceived,
  callWaitingReceived,
  callAgentReceived,
  queueRealtimeUpdate,
  ticketPipelineChanged,
  ticketPipelineListChanged,
  ticketChanged,
  ticketListChanged,
  ticketStatusChanged,
  ticketStatusListChanged,
  ticketActivityChanged,
};
