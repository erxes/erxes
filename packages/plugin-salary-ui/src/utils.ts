import { generatePaginationParams } from '@erxes/ui/src/utils/router';

export const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || {}),
  dateFilter: JSON.parse(queryParams.dateFilter || 'false'),
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userIds: queryParams.userIds,
  departmentIds: queryParams.departmentIds,
  branchIds: queryParams.branchIds
});
