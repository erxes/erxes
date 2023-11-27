import React, { useCallback, useRef, useEffect } from 'react';

import ReactFlow, {
  Background,
  ConnectionMode,
  Controls,
  addEdge,
  getOutgoers,
  updateEdge,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { generateEdges, generateNodes } from './utils';
import CustomNode from './Node';
import { AutomationConstants, ITrigger } from '../../types';
import { IAction } from '@erxes/ui-automations/src/types';

type Props = {
  triggers: ITrigger[];
  actions: IAction[];
  onConnection: ({
    sourceId,
    targetId,
    type
  }: {
    sourceId: string;
    targetId: string;
    type: string;
  }) => void;
  showDrawer: boolean;
  toggleDrawer: (type: string, awaitingActionId?: string) => void;
  onDoubleClick: (type: string, id: string) => void;
  removeItem: (type: string, id: string) => void;
  constants: AutomationConstants;
};

const nodeTypes = {
  custom: CustomNode
};

const fitViewOptions = { padding: 4 };

function AutomationEditor({
  triggers,
  actions,
  onConnection,
  ...props
}: Props) {
  const edgeUpdateSuccessful = useRef(true);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges({ triggers, actions })
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    generateNodes({ triggers, actions }, props)
  );

  useEffect(() => {
    resetNodes();
    setEdges(generateEdges({ triggers, actions }));
  }, [triggers?.length, actions?.length]);

  const resetNodes = () => {
    const updatedNodes: any[] = generateNodes({ triggers, actions }, props);

    const mergedArray = updatedNodes.map(node1 => {
      let node2 = nodes.find(o => o.id === node1.id);

      if (node2) {
        return { ...node1, position: { ...node1.position, ...node2.position } };
      }
      return node1;
    });
    setNodes(mergedArray);
  };

  const onConnect = useCallback(params => {
    console.log({ params });
    setEdges(eds => {
      const updatedEdges = addEdge({ ...params }, eds);

      const source = nodes.find(node => node.id === params.source);

      console.log({ params, eds });

      onConnection({
        sourceId: params.source,
        targetId: params.target,
        type: source?.data?.type
      });

      return updatedEdges;
    });
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges(els => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges(eds => eds.filter(e => e.id !== edge.id));
      onConnect({ sourceId: edge.source, targetId: undefined });
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const isValidConnection = useCallback(
    connection => {
      const target = nodes.find(node => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      return !hasCycle(target);
    },
    [nodes, edges]
  );

  const onPaneClick = () => {
    if (props.showDrawer) {
      props.toggleDrawer('actions');
    }
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
        onEdgeUpdate={onEdgeUpdate}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </>
  );
}

export default AutomationEditor;
