import { Background, ReactFlow } from '@xyflow/react';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import {
  STRUCTURE_CANVAS_FIT_VIEW_OPTIONS,
  STRUCTURE_CANVAS_MIN_ZOOM,
} from '../../constants/structureCanvas';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureCanvasFocus } from '../../hooks/useStructureCanvasFocus';
import { structureDraftParentState } from '../../states/structureViewState';
import { buildStructureCanvas } from '../../utils/structureCanvasLayout';
import { StructureCanvasCard } from './StructureCanvasCard';
import { StructureCanvasControls } from './StructureCanvasControls';
import { StructureCanvasDraftNode } from './StructureCanvasDraftNode';
import { StructureCanvasEdge } from './StructureCanvasEdge';
import '@xyflow/react/dist/style.css';

const STRUCTURE_CANVAS_NODE_TYPES = {
  card: StructureCanvasCard,
  draft: StructureCanvasDraftNode,
};

const STRUCTURE_CANVAS_EDGE_TYPES = { structure: StructureCanvasEdge };

export const StructureCanvas = () => {
  const theme = useAtomValue(themeState);
  const draftParentId = useAtomValue(structureDraftParentState);
  const { entities, typesById, isExpanded } = useStructureWorkspace();
  const [ready, setReady] = useState(false);
  const { nodes, edges } = useMemo(
    () =>
      buildStructureCanvas({
        entities,
        typesById,
        isExpanded,
        draftParentId,
      }),
    [entities, typesById, isExpanded, draftParentId],
  );

  useStructureCanvasFocus(nodes, ready);

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={STRUCTURE_CANVAS_NODE_TYPES}
        edgeTypes={STRUCTURE_CANVAS_EDGE_TYPES}
        colorMode={theme}
        minZoom={STRUCTURE_CANVAS_MIN_ZOOM}
        onInit={(instance) => {
          instance.fitView(STRUCTURE_CANVAS_FIT_VIEW_OPTIONS);
          setReady(true);
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        onlyRenderVisibleElements
      >
        <Background gap={16} />
        <StructureCanvasControls />
      </ReactFlow>
    </div>
  );
};
