import React, { useCallback, useRef } from 'react';

import ReactFlow, {
  Background,
  Controls,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AutomationConstants, IAutomation, IAutomationNote } from '../../types';
import Edge from './Edge';
import CustomNode from './Node';

type Props = {
  automation: IAutomation;
  automationNotes?: IAutomationNote[];
  save: (params: any) => void;
  saveLoading: boolean;
  id: string;
  history: any;
  queryParams: any;
  constants: AutomationConstants;
};

const nodeTypes = {
  custom: CustomNode
};

const edgeTypes = {
  floating: Edge
};

const generateNodes = (automation: IAutomation) => {
  const { actions, triggers } = automation;

  const nodes = [...triggers, ...actions].map((node: any) => {
    return {
      id: node.id,
      data: {
        label: node.label,
        description: node.description,
        icon: node.icon,
        type: node.actionId ? 'trigger' : 'action'
      },
      position: { x: 2, y: 2 },
      type: 'custom'
    };
  });

  return nodes;
};

const generateEdges = (automation: IAutomation) => {
  const { actions, triggers } = automation;

  const edges: any = [];

  const commonEdgeDoc = {
    id: `${Math.random()}`,
    updatable: 'target'
  };

  for (const trigger of triggers) {
    edges.push({
      ...commonEdgeDoc,
      source: trigger.id,
      target: trigger.actionId || ''
    });
  }

  for (const action of actions) {
    edges.push({
      ...commonEdgeDoc,
      source: action.id,
      target: action.nextActionId || ''
    });
  }

  return edges;
};

function TestEditor({ automation }: Props) {
  const edgeUpdateSuccessful = useRef(true);
  const [nodes, , onNodesChange] = useNodesState(generateNodes(automation));
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges(automation)
  );

  const onConnect = useCallback(
    params =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'floating'
          },
          eds
        )
      ),
    []
  );

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges(els => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges(eds => eds.filter(e => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onEdgeUpdate={onEdgeUpdate}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </>
  );
}

export default TestEditor;
