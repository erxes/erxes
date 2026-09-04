import { gql } from '@apollo/client';

export const POLL_ADD = gql`
  mutation pollAdd(
    $title: String!
    $question: String!
    $channelId: String
    $options: [PollOptionInput!]!
    $allowMultiselect: Boolean
    $durationHours: Int
  ) {
    pollAdd(
      title: $title
      question: $question
      channelId: $channelId
      options: $options
      allowMultiselect: $allowMultiselect
      durationHours: $durationHours
    ) {
      _id
    }
  }
`;

export const POLL_EDIT = gql`
  mutation pollEdit(
    $_id: String!
    $title: String!
    $question: String!
    $channelId: String
    $options: [PollOptionInput!]!
    $allowMultiselect: Boolean
    $durationHours: Int
  ) {
    pollEdit(
      _id: $_id
      title: $title
      question: $question
      channelId: $channelId
      options: $options
      allowMultiselect: $allowMultiselect
      durationHours: $durationHours
    ) {
      _id
      title
      question
      channelId
      options {
        _id
        text
        order
      }
      allowMultiselect
      durationHours
      status
    }
  }
`;

export const POLL_REMOVE = gql`
  mutation pollRemove($_ids: [String!]!) {
    pollRemove(_ids: $_ids)
  }
`;

export const POLL_TOGGLE_STATUS = gql`
  mutation pollToggleStatus($_ids: [String!]!, $status: String!) {
    pollToggleStatus(_ids: $_ids, status: $status)
  }
`;

export const POLL_SEND_TO_CONVERSATION = gql`
  mutation pollSendToConversation($_id: String!, $conversationId: String!) {
    pollSendToConversation(_id: $_id, conversationId: $conversationId) {
      _id
    }
  }
`;
