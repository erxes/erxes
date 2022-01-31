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
    closeDateType: queryParams.closeDateType,
    assignedToMe: queryParams.assignedToMe
  };
};
