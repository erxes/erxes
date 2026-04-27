import { useQuery } from '@apollo/client';
import { GET_BOARD_PIPELINE_STAGE_NAME } from '../graphql/actionNodeContentQueries';

export const useBoardPipelineStageInlineText = ({
  boardId,
  pipelineId,
  stageId,
  skip,
}: {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  skip?: boolean;
}) => {
  const { data, loading, error } = useQuery(GET_BOARD_PIPELINE_STAGE_NAME, {
    variables: { boardId, pipelineId, stageId },
    skip: skip,
  });

  const boardName = data?.salesBoardDetail?.name || 'No board';
  const pipelineName = data?.salesPipelineDetail?.name || 'No pipeline';
  const stageName = data?.salesStageDetail?.name || 'No stage';

  return { boardName, pipelineName, stageName, loading, error };
};
