import { MarqueeConvertToWorkflowAction } from '@/automations/components/builder/marquee/MarqueeConvertToWorkflowAction';
import { MarqueeDeleteSelectionAction } from '@/automations/components/builder/marquee/MarqueeDeleteSelectionAction';
import { useMarqueeSelection } from '@/automations/components/builder/hooks/useMarqueeSelection';
import { describeNodeSelection } from '@/automations/utils/automationBuilderUtils/nodeSelection';
import { Panel } from '@xyflow/react';

export const MarqueeSelectionPanel = ({
  isMarqueeMode,
}: {
  isMarqueeMode: boolean;
}) => {
  const { canConvertToWorkflow, clearSelection, selectedIds, selection } =
    useMarqueeSelection();

  if (!isMarqueeMode || selectedIds.length < 2) {
    return null;
  }

  return (
    <Panel position="top-center" className="pointer-events-auto">
      <div className="flex items-center gap-3 rounded-md border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {describeNodeSelection(selection)} selected
        </span>
        {canConvertToWorkflow && (
          <MarqueeConvertToWorkflowAction
            actionIds={selection.actionIds}
            onConverted={clearSelection}
          />
        )}
        <MarqueeDeleteSelectionAction
          selection={selection}
          selectedIds={selectedIds}
          onDeleted={clearSelection}
        />
      </div>
    </Panel>
  );
};
