import { gql } from '~/gql';

export const SALES_DEAL_DOCUMENTS = gql(`
  query SalesDealDocuments($contentType: String, $limit: Int) {
    documents(contentType: $contentType, limit: $limit) {
      list { _id name code content }
      pageInfo { startCursor endCursor hasNextPage hasPreviousPage }
      totalCount
    }
  }
`);

export const SALES_DEAL_PROCESS_DOCUMENT = gql(`
  query SalesDealProcessDocument($_id: String!, $replacerIds: [String], $config: JSON) {
    documentsProcess(_id: $_id, replacerIds: $replacerIds, config: $config)
  }
`);
