import { isEnabled } from '@erxes/ui/src/utils/core';

const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String, $direction: String, $callID: String!) {
    callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone, direction: $direction, callID: $callID) {
      channels {
        _id
        name
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
`;

const messageFields = `
  _id
  content
  mentionedUserIds
  conversationId

  internal
  contentType
  customerId
  userId
  createdAt
  isCustomerRead
 
  ${
    isEnabled('contacts')
      ? `
      customer {
        _id
        avatar
        firstName
        primaryPhone

        tagIds
        ${
          isEnabled('tags')
            ? `
            getTags {
              _id
              name
              colorCode
            }
          `
            : ``
        }
      }
    `
      : ``
  }
`;

const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String,
    $content: String,
    $contentType: String,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [AttachmentInput],
    $extraInfo: JSON
  ) {
    conversationMessageAdd(
      conversationId: $conversationId,
      content: $content,
      contentType: $contentType,
      mentionedUserIds: $mentionedUserIds,
      internal: $internal,
      attachments: $attachments,
      extraInfo: $extraInfo
    ) {
      ${messageFields}
    }
  }
`;

const addActiveSession = `
  mutation CallUpdateActiveSession {
    callUpdateActiveSession
  }
`;

const callTerminateSession = `
  mutation callTerminateSession {
    callTerminateSession
  }
`;

const callDisconnect = `
  mutation callDisconnect {
    callDisconnect
  }
`;

const callHistoryAdd = `
  mutation CallHistoryAdd($receiverNumber: String, $callerNumber: String, $callDuration: Int, $callStartTime: Date, $callEndTime: Date, $callStatus: String, $callType: String, $sessionId: String,  $conversationId: String) {
  callHistoryAdd(receiverNumber: $receiverNumber, callerNumber: $callerNumber, callDuration: $callDuration, callStartTime: $callStartTime, callEndTime: $callEndTime, callStatus: $callStatus, callType: $callType, sessionId: $sessionId, conversationId: $conversationId) {
    _id
    receiverNumber
    callerNumber
    callDuration
    callStartTime
    callEndTime
    callType
    callStatus
    sessionId
    modifiedAt
    createdAt
    createdBy
    modifiedBy
    extentionNumber
    conversationId
  }
}
`

const callHistoryEdit = `
  mutation CallHistoryEdit($receiverNumber: String, $callerNumber: String, $callDuration: Int, $callStartTime: Date, $callEndTime: Date, $callType: String, $callStatus: String, $sessionId: String, $conversationId: String) {
    callHistoryEdit(receiverNumber: $receiverNumber, callerNumber: $callerNumber, callDuration: $callDuration, callStartTime: $callStartTime, callEndTime: $callEndTime, callType: $callType, callStatus: $callStatus, sessionId: $sessionId, conversationId: $conversationId) 
}`;

const callHistoryEditStatus = ` 
  mutation CallHistoryEditStatus($callStatus: String, $conversationId: String) {
    callHistoryEditStatus(callStatus: $callStatus, conversationId: $conversationId)
}`;

const callHistoryRemove = ` 
  mutation CallHistoryRemove($id: String!) {
    callHistoryRemove(_id: $id)
}`;

const callsUpdateConfigs = `
  mutation callsUpdateConfigs($configsMap: JSON!) {
    callsUpdateConfigs(configsMap: $configsMap)
  }
`;

export default {
  callsIntegrationUpdate,
  customersAdd,
  conversationMessageAdd,
  addActiveSession,
  callTerminateSession,
  callDisconnect,
  callHistoryEdit,
  callHistoryAdd,
  callHistoryRemove,
  callsUpdateConfigs,
  callHistoryEditStatus,
};
