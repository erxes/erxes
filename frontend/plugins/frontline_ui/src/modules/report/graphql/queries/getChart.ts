import { gql } from '@apollo/client';

export const GET_CHART = gql`
  query ChartGetResult {
    chartGetResult {
      ConversationOpen {
        count
        percentage
      }
      ConversationClosed {
        count
        percentage
      }
      ConversationResolved {
        count
        percentage
      }
      ConversationSources {
        topConverting {
          _id
          count
          name
          percentage
        }
        topPerforming {
          _id
          count
          name
          percentage
        }
      }
      ConversationTag {
        _id
        count
        percentage
        name
      }
    }
  }
`;
