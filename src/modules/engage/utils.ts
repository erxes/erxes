export const generateListQueryVariables = ({ queryParams }) => ({
  ids: queryParams.ids,
  kind: queryParams.kind,
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  status: queryParams.status,
  tag: queryParams.tag
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
