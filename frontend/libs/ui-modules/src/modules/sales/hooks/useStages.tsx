import { QueryHookOptions, useQuery } from '@apollo/client';

import { useQueryState } from 'erxes-ui';

import { GET_STAGE_DETAIL, GET_STAGES } from '../graphql/queries/stagesQueries';
import { IStage } from '../types/stages';

export const useStages = (
  options?: QueryHookOptions<{ salesStages: IStage[] }>,
) => {
  const { data, loading, error } = useQuery<{ salesStages: IStage[] }>(
    GET_STAGES,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return { stages: data?.salesStages || [], loading, error };
};

export const useStageDetail = (
  options?: QueryHookOptions<{ salesStageDetail: IStage }>,
) => {
  const [stageIdFromQuery] = useQueryState<string>('stageId');
  const stageId = options?.variables?._id || stageIdFromQuery;

  const { data, loading, error } = useQuery<{ salesStageDetail: IStage }>(
    GET_STAGE_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
        _id: stageId,
      },
      skip: !stageId,
    },
  );

  return { stageDetail: data?.salesStageDetail, loading, error };
};
