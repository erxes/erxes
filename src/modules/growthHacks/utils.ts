import { IFilterParams } from 'modules/boards/types';

interface IGrowthHackFilterParams extends IFilterParams {
  pipelineId?: string;
}

export const getFilterParams = (queryParams: IGrowthHackFilterParams) => {
  if (!queryParams) {
    return {};
  }

  return {
    pipelineId: queryParams.pipelineId,
    search: queryParams.search,
    assignedUserIds: queryParams.assignedUserIds,
    nextDay: queryParams.nextDay,
    nextWeek: queryParams.nextWeek,
    nextMonth: queryParams.nextMonth,
    noCloseDate: queryParams.noCloseDate,
    overdue: queryParams.overdue
  };
};
