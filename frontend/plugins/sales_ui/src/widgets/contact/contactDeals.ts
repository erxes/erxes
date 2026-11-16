import { gql } from '~/gql';

export const SALES_CONTACT_DEALS = gql(`
  query salesContactDeals(
    $customerId: String
    $companyId: String
    $limit: Int
  ) {
    deals(customerId: $customerId, companyId: $companyId, limit: $limit) {
      list {
        _id
        name
        number
        status
        priority
        closeDate
        assignedUserIds
        amount
        boardId
        pipelineId
        pipeline {
          _id
          name
        }
        stage {
          _id
          name
          pipelineId
        }
      }
    }
  }
`);
