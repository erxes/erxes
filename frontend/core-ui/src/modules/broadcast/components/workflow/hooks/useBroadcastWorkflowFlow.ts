import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { CANVAS_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { NodeData } from '@/automations/types';
import { BROADCAST_START_NODE_ID } from '@/broadcast/components/workflow/components/BroadcastStartNode';
import { useBroadcastWorkflowCanvas } from '@/broadcast/components/workflow/hooks/useBroadcastWorkflowCanvas';
import {
  Connection,
  Edge,
  IsValidConnection,
  Node,
  NodeMouseHandler,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect } from 'react';

// The builder validates a Connection; React Flow also offers an existing
// edge here when one is being reconnected
const toConnection = (edge: Edge | Connection): Connection => ({
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
});

/**
 * The campaign flow as React Flow props: nodes and edges kept in step with
 * the form, refitted when a step is added or removed, and read-only when the
 * campaign can no longer change.
 */
export const useBroadcastWorkflowFlow = (readOnly?: boolean) => {
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

  // A handful of steps: the whole flow is refitted once the new node has a
  // measured size
  const nodeCount = generatedNodes.length;
  useEffect(() => {
    if (nodesInitialized) {
      fitView(CANVAS_FIT_VIEW_OPTIONS);
    }
  }, [nodeCount, nodesInitialized, fitView]);

  // The audience is chosen in the campaign form; its node has nothing here
  const handleNodeDoubleClick: NodeMouseHandler<Node<NodeData>> = useCallback(
    (event, node) => {
      if (node.id !== BROADCAST_START_NODE_ID) {
        onNodeDoubleClick(event, node);
      }
    },
    [onNodeDoubleClick],
  );

  const handleIsValidConnection: IsValidConnection<Edge> = useCallback(
    (edge) => isValidConnection(toConnection(edge)),
    [isValidConnection],
  );

  const handleNodeDragStop = useCallback(
    () => syncPositionUpdates(),
    [syncPositionUpdates],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: readOnly ? undefined : onConnect,
    isValidConnection: handleIsValidConnection,
    onNodeClick,
    onNodeDoubleClick: readOnly ? undefined : handleNodeDoubleClick,
    onNodeDragStop: readOnly ? undefined : handleNodeDragStop,
    onPaneClick,
    nodesDraggable: !readOnly,
    nodesConnectable: !readOnly,
    deleteKeyCode: readOnly ? null : undefined,
  };
};
