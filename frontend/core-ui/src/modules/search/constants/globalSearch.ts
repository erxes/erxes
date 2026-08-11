export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_PER_GROUP = 5;
export const GLOBAL_SEARCH_DEBOUNCE = 350;

export const GLOBAL_SEARCH_OPERATION_NAME = 'GlobalSearch';
export const GLOBAL_SEARCH_VARIABLE_DEFS =
  '$searchValue: String!, $limit: Int!';
export const GLOBAL_SEARCH_ALLOWED_VARIABLES = new Set([
  'searchValue',
  'limit',
]);
