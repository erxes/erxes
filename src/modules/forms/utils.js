export const generateListQueryVariables = ({ queryParams }) => ({
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  tag: queryParams.tag,
  kind: 'form'
});
