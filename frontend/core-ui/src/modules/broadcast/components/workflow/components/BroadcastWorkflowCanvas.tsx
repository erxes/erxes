import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
} from '@/automations/constants';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { BroadcastActionNode } from '@/broadcast/components/workflow/components/BroadcastActionNode';
import {
  BroadcastStartNode,
  BROADCAST_START_NODE_ID,
} from '@/broadcast/components/workflow/components/BroadcastStartNode';
import { useBroadcastWorkflowCanvas } from '@/broadcast/components/workflow/hooks/useBroadcastWorkflowCanvas';
import {
  Background,
  Connection,
  NodeMouseHandler,
  Controls,
  Edge,
  IsValidConnection,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
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
  const { nodes: generatedNodes, edges: generatedEdges } =
    useBroadcastWorkflowCanvas(readOnly);
  const { onConnect, isValidConnection } = useNodeConnect();
  const { onNodeClick, onNodeDoubleClick, onPaneClick } = useNodeEvents();
  const { syncPositionUpdates } = useAutomationFormController();
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(generatedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(generatedEdges);

  useEffect(() => setNodes(generatedNodes), [generatedNodes, setNodes]);
  useEffect(() => setEdges(generatedEdges), [generatedEdges, setEdges]);

  // A campaign's flow is a handful of steps, so the whole of it is refitted
  // whenever one is added or removed — waiting for measurement, otherwise the
  // new node has no size to fit to yet.
  const nodeCount = generatedNodes.length;
  useEffect(() => {
    if (nodesInitialized) {
      fitView(CANVAS_FIT_VIEW_OPTIONS);
    }
  }, [nodeCount, nodesInitialized, fitView]);

  // The audience is chosen in the campaign form, so its node has nothing to
  // configure here.
  const handleNodeDoubleClick: NodeMouseHandler<Node<NodeData>> = (
    event,
    node,
  ) => {
    if (node.id === BROADCAST_START_NODE_ID) {
      return;
    }

    onNodeDoubleClick(event, node);
  };

  // The builder validates a Connection; React Flow also offers an existing
  // edge here when one is being reconnected.
  const handleIsValidConnection: IsValidConnection<Edge> = (edge) =>
    isValidConnection({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
    } satisfies Connection);

  return (
    <div className="relative h-full min-w-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={broadcastNodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        isValidConnection={handleIsValidConnection}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={readOnly ? undefined : handleNodeDoubleClick}
        onNodeDragStop={readOnly ? undefined : () => syncPositionUpdates()}
        onPaneClick={onPaneClick}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        deleteKeyCode={readOnly ? null : undefined}
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
