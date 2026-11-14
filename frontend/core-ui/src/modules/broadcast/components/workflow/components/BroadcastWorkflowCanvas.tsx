import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
} from '@/automations/constants';
import { AutomationNodeType } from '@/automations/types';
import { BroadcastActionNode } from '@/broadcast/components/workflow/components/BroadcastActionNode';
import { BroadcastStartNode } from '@/broadcast/components/workflow/components/BroadcastStartNode';
import { useBroadcastWorkflowFlow } from '@/broadcast/components/workflow/hooks/useBroadcastWorkflowFlow';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import '@xyflow/react/dist/style.css';

// Broadcast draws the builder's own node types with its own components, so
// nothing about a campaign has to enter the shared registry.
const broadcastNodeTypes = {
  [AutomationNodeType.Trigger]: BroadcastStartNode,
  [AutomationNodeType.Action]: BroadcastActionNode,
};

export const BroadcastWorkflowCanvas = ({
  readOnly,
}: {
  readOnly?: boolean;
}) => {
  const theme = useAtomValue(themeState);
  const flowProps = useBroadcastWorkflowFlow(readOnly);

  return (
    <div className="relative h-full min-w-0 flex-1">
      <ReactFlow
        {...flowProps}
        nodeTypes={broadcastNodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
        connectionLineComponent={ConnectionLine}
        colorMode={theme}
        minZoom={CANVAS_MIN_ZOOM}
        maxZoom={CANVAS_MAX_ZOOM}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
