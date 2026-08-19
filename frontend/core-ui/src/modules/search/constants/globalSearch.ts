export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_PAGE_SIZE = 20;
export const GLOBAL_SEARCH_PREVIEW_LIMIT = 5;
export const GLOBAL_SEARCH_DEBOUNCE = 350;

export const GLOBAL_SEARCH_OPERATION_NAME = 'GlobalSearch';
export const GLOBAL_SEARCH_PAGE_OPERATION_NAME = 'GlobalSearchPage';
export const GLOBAL_SEARCH_ALLOWED_VARIABLES = new Set([
  'searchValue',
  'limit',
  'cursor',
]);