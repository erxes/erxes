import { gql } from '@apollo/client';
import { commonListFields } from '~/modules/deals/graphql/queries/DealsQueries';

export const DEAL_LIST_CHANGED = gql`
  subscription salesDealListChanged($pipelineId: String!, $userId: String, $filter: IDealFilter) {
    salesDealListChanged(pipelineId: $pipelineId, userId: $userId, filter: $filter) {
      action
      deal {
        products {
          _id
          name
        }
        unUsedAmount
        amount
        ${commonListFields}
        departments {
          _id
          title
        }
        branches {
          _id
          title
        }
        relations
      }
    }
  }
`;
