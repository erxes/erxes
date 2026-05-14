export const GQL_CURSOR_PARAM_DEFS = `
  limit: Int
  cursor: String
  cursorMode: CURSOR_MODE
  direction: CURSOR_DIRECTION
  orderBy: JSON
  sortMode: String
  aggregationPipeline: [JSON]
`;

export const GQL_OFFSET_PARAM_DEFS = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: String
`;
