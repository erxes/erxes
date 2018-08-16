export const generateListQueryVariables = ({ queryParams }) => ({
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  segment: queryParams.segment,
  tag: queryParams.tag,
  ids: queryParams.ids,
  searchValue: queryParams.searchValue,
  leadStatus: queryParams.leadStatus,
  lifecycleState: queryParams.lifecycleState,
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
});
