import { generatePaginationParams } from 'modules/common/utils/router';

export const generateListQueryVariables = ({ queryParams }) => ({
  ...generatePaginationParams(queryParams),
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
