import { useQuery } from '@apollo/client';
import { GET_BOARD_PIPELINE_STAGE_NAME } from '../graphql/actionNodeContentQueries';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('sales');
  const hasIds = !!boardId && !!pipelineId && !!stageId;
  // The query needs all three ids; a partial config shows the empty labels.
  const { data, loading, error } = useQuery(GET_BOARD_PIPELINE_STAGE_NAME, {
    variables: hasIds ? { boardId, pipelineId, stageId } : undefined,
    skip: skip || !hasIds,
  });

  const boardName = data?.salesBoardDetail?.name || t('no-board');
  const pipelineName = data?.salesPipelineDetail?.name || t('no-pipeline');
  const stageName = data?.salesStageDetail?.name || t('no-stage');

  return { boardName, pipelineName, stageName, loading, error };
};
