import { gql } from '~/gql';

// A customer's or company's deals, by the contact kept on the deals.
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
        boardId
        pipelineId
        stage {
          _id
          name
          pipelineId
        }
      }
    }
  }
`);
