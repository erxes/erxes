import { gql } from '@apollo/client';

const GET_TICKET_CUSTOMER_DETAILS = gql`
  query WidgetsTicketCustomerDetail($customerId: String, $type: String) {
    widgetsTicketCustomerDetail(customerId: $customerId, type: $type) {
      _id
      avatar
      email
      phone
      firstName
      lastName
    }
  }
`;

const GET_WIDGET_TAGS = gql`
  query WidgetsGetTicketTags($configId: String, $parentId: String) {
    widgetsGetTicketTags(configId: $configId, parentId: $parentId) {
      _id
      name
      type
      description
    }
  }
`;

const GET_TICKET_PROGRESS = gql`
  query WidgetTicketCheckProgress($number: String!) {
    widgetTicketCheckProgress(number: $number) {
      _id
      name
      description
      pipelineId
      statusId
      priority
      labelIds
      tagIds
      assigneeId
      createdBy
      userId
      startDate
      targetDate
      createdAt
      updatedAt
      channelId
      statusChangedDate
      number
      status {
        _id
        color
        name
        description
        type
      }
    }
  }
`;

const GET_TICKETS_BY_CUSTOMER_ID = gql`
  query WidgetTicketsByCustomer($customerId: String) {
    widgetTicketsByCustomer(customerId: $customerId) {
      _id
      name
      description
      pipelineId
      statusId
      priority
      labelIds
      tagIds
      assigneeId
      createdBy
      userId
      startDate
      targetDate
      createdAt
      updatedAt
      channelId
      statusChangedDate
      number
      status {
        _id
        color
        name
        description
        type
      }
      assignee {
        _id
        details {
          avatar
          firstName
          lastName
          fullName
        }
      }
    }
  }
`;

export {
  GET_TICKET_CUSTOMER_DETAILS,
  GET_WIDGET_TAGS,
  GET_TICKET_PROGRESS,
  GET_TICKETS_BY_CUSTOMER_ID,
};
