import ActivityLogsQueiries from 'erxes-ui/lib/activityLogs/graphql/queries';

const activityLogs = ActivityLogsQueiries.activityLogs;

const emailDeliveryDetail = `
  query emailDeliveryDetail($_id: String! ) {
    emailDeliveryDetail(_id: $_id ) {
      _id
      subject
      body
      to
      cc
      bcc
      attachments
      from
      kind
      userId
      customerId
      createdAt

      fromUser {
        _id
        details {
          avatar
          fullName
          position
        }
      }
      fromEmail
    }
  }
`;

export default {
  activityLogs,
  emailDeliveryDetail
};
