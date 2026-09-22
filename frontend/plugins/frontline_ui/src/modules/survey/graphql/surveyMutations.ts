import { gql } from '@apollo/client';

export const SURVEY_ADD = gql`
  mutation surveyAdd(
    $title: String!
    $channelId: String
    $brandId: String
    $steps: [SurveyStepInput!]
    $durationHours: Int
  ) {
    surveyAdd(
      title: $title
      channelId: $channelId
      brandId: $brandId
      steps: $steps
      durationHours: $durationHours
    ) {
      _id
    }
  }
`;

export const SURVEY_EDIT = gql`
  mutation surveyEdit(
    $_id: String!
    $title: String!
    $channelId: String
    $brandId: String
    $steps: [SurveyStepInput!]
    $durationHours: Int
  ) {
    surveyEdit(
      _id: $_id
      title: $title
      channelId: $channelId
      brandId: $brandId
      steps: $steps
      durationHours: $durationHours
    ) {
      _id
      title
      question
      channelId
      brandId
      options {
        _id
        text
        order
        ticketCreationEnabled
        ticketCreationThreshold
        ticketPipelineId
        ticketStatusId
        ticketCreated
        ticketId
      }
      steps {
        _id
        name
        description
        order
        question
        allowMultiselect
        options {
          _id
          text
          order
          ticketCreationEnabled
          ticketCreationThreshold
          ticketPipelineId
          ticketStatusId
          ticketCreated
          ticketId
        }
      }
      allowMultiselect
      durationHours
      status
    }
  }
`;

export const SURVEY_REMOVE = gql`
  mutation surveyRemove($_ids: [String!]!) {
    surveyRemove(_ids: $_ids)
  }
`;

export const SURVEY_TOGGLE_STATUS = gql`
  mutation surveyToggleStatus($_ids: [String!]!, $status: String!) {
    surveyToggleStatus(_ids: $_ids, status: $status)
  }
`;

export const SURVEY_SEND_TO_CONVERSATION = gql`
  mutation surveySendToConversation($_id: String!, $conversationId: String!) {
    surveySendToConversation(_id: $_id, conversationId: $conversationId) {
      _id
    }
  }
`;
