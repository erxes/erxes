import { RelationSettingsWidget } from 'ui-modules';
import { usePipelinePurchaseContext } from '@/deals/pipelines/hooks/usePipelinePurchaseContext';

// Another plugin's own tab on this pipeline, e.g. loyalty's points.
export const PipelineRelationSettings = ({
  moduleKey,
  pipelineId,
  pipelineName,
}: {
  moduleKey: string;
  pipelineId: string;
  pipelineName: string;
}) => (
  <RelationSettingsWidget
    moduleKey={moduleKey}
    contentType="sales:pipeline"
    contentId={pipelineId}
    context={usePipelinePurchaseContext(pipelineId, pipelineName)}
  />
);
