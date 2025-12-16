import { gql } from '@apollo/client';

export const GET_CHART = gql`
  query ChartGetResult {
    chartGetResult {
      ConversationOpen {
        count
        percentage
        __typename
      }
      ConversationResolved {
        count
        percentage
        __typename
      }
      ConversationResolved {
        count
        percentage
        __typename
      }
      ConversationClosed {
        count
        percentage
        __typename
      }
      ConversationSources {
        name
        count
        percentage
        __typename
      }
      ConversationTag {
        name
        count
        percentage
        __typename
      }
      __typename
    }
  }
`;
