export const GQL_PAGE_INFO = `
  totalCount
  pageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const GQL_CURSOR_PARAM_DEFS = `
  $cursor: String
  $cursorMode: CURSOR_MODE
  $direction: CURSOR_DIRECTION
  $limit: Int
`;

export const GQL_CURSOR_PARAMS = `
  cursor: $cursor
  cursorMode: $cursorMode
  direction: $direction
  limit: $limit
`;
