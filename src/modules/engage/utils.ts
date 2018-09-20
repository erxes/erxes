export const generateListQueryVariables = ({ queryParams }) => ({
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  kind: queryParams.kind,
  status: queryParams.status,
  tag: queryParams.tag,
  ids: queryParams.ids
});

export const crudMutationsOptions = () => {
  return {
    refetchQueries: [
      'engageMessages',
      'engageMessagesTotalCount',
      'kindCounts',
      'statusCounts'
    ]
  };
};
