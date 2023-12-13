import React, { useCallback, useEffect, useRef } from 'react';
import 'reactflow/dist/style.css';
import { IAction } from '@erxes/ui-automations/src/types';
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
import {
  AutomationConstants,
  IAutomation,
  IAutomationNote,
  ITrigger
} from '../../types';
import CustomNode, { ScratchNode } from './Node';
import { generateEdges, generateNodes } from './utils';

type Props = {
  automation: IAutomation;
  triggers: ITrigger[];
  actions: IAction[];
  automationNotes?: IAutomationNote[];
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
  toggleDrawer: ({
    type,
    awaitingActionId
  }: {
    type: string;
    awaitingActionId?: string;
  }) => void;
  onDoubleClick: (type: string, id: string) => void;
  removeItem: (type: string, id: string) => void;
  constants: AutomationConstants;
  onChangePositions: (type: string, id: string, postions: any) => void;
};

const nodeTypes = {
  custom: CustomNode,
  scratch: ScratchNode
};

const fitViewOptions = { padding: 2 };

function AutomationEditor({
  triggers,
  actions,
  onConnection,
  onChangePositions,
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
  }, [JSON.stringify(triggers), JSON.stringify(actions)]);

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
    setEdges(generateEdges({ triggers, actions }));
  };

  const generateConnect = (params, source) => {
    const { sourceHandle } = params;

    let info: any = {
      ...params,
      sourceId: params.source,
      targetId: params.target,
      type: source?.data?.nodeType
    };

    if (sourceHandle) {
      if (params?.sourceHandle.includes(params?.source)) {
        const [_sourceId, optionalConnectId] = params.sourceHandle.split('-');
        info.optionalConnectId = optionalConnectId;
        info.connectType = 'optional';
      }
    }

    return info;
  };

  const onConnect = useCallback(params => {
    setEdges(eds => {
      const updatedEdges = addEdge({ ...params }, eds);

      const source = nodes.find(node => node.id === params.source);

      onConnection(generateConnect(params, source));

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
      let info: any = { source: edge.source, target: undefined };

      const sourceNode = nodes.find(n => n.id === edge.source);

      if (edge.sourceHandle.includes(sourceNode?.id)) {
        info.optionalConnectId = undefined;
        info.connectType = 'optional';
      }

      onConnect(info);
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
      props.toggleDrawer({ type: '' });
    }
  };

  const onNodeDragStop = (_, node) => {
    onChangePositions(node?.data?.nodeType, node.id, node.position);
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
        onNodeDragStop={onNodeDragStop}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </>
  );
}

export default AutomationEditor;
