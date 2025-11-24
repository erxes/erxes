import { Skeleton } from 'erxes-ui';
import { useBoardPipelineStageInlineText } from '../hooks/useBoardPipelineStageInlineText';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { TSalesActionConfigForm } from '../states/salesActionConfigFormDefinitions';

export const BoardPipelineStageInlineText = ({
  config,
}: {
  config?: TSalesActionConfigForm;
}) => {
  const { boardId, pipelineId, stageId } = config || {};
  const { boardName, pipelineName, stageName, loading, error } =
    useBoardPipelineStageInlineText({
      boardId,
      pipelineId,
      stageId,
      skip: !config,
    });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }

  return (
    <AutomationNodeMetaInfoRow
      fieldName="Where"
      content={`Board: ${boardName} - Pipeline: ${pipelineName} - Stage: ${stageName}`}
    />
  );
};
