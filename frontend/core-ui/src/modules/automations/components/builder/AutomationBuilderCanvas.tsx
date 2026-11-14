import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { AutomationBuilderCanvasDragOverlay } from '@/automations/components/builder/AutomationBuilderCanvasDragOverlay';
import { AutomationBuilderControls } from '@/automations/components/builder/controls/AutomationBuilderControls';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import { useAutomationBuilderCanvas } from '@/automations/components/builder/hooks/useAutomationBuilderCanvas';
import { nodeTypes } from '@/automations/components/builder/nodes/nodeTypesRegistry';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
} from '@/automations/constants';
import { MarqueeSelectionPanel } from '@/automations/components/builder/marquee/MarqueeSelectionPanel';
import { Background, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const MINI_MAP_STYLE = { width: 140, height: 100 };

export const AutomationBuilderCanvas = () => {
  const {
    theme,
    reactFlowWrapper,
    editorWrapper,
    showGrid,
    showMiniMap,
    isMarqueeMode,
    flowProps,
  } = useAutomationBuilderCanvas();

  return (
    <div className="relative h-full flex-1" ref={reactFlowWrapper}>
      <ReactFlow
        ref={editorWrapper}
        {...flowProps}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
        connectionLineComponent={ConnectionLine}
        colorMode={theme}
        minZoom={CANVAS_MIN_ZOOM}
        maxZoom={CANVAS_MAX_ZOOM}
      >
        {showGrid && <Background />}
        {showMiniMap && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            style={MINI_MAP_STYLE}
            className="overflow-hidden rounded-md border shadow-sm"
          />
        )}
        <MarqueeSelectionPanel isMarqueeMode={isMarqueeMode} />
        <AutomationBuilderControls />
      </ReactFlow>
      <AutomationBuilderCanvasDragOverlay />
    </div>
  );
};
