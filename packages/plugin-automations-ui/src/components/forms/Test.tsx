import React, { useCallback } from 'react';

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AutomationConstants, IAutomation, IAutomationNote } from '../../types';

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

const initialNodes = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Node 1' },
    position: { x: 100, y: 100 }
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'Node 2' },
    position: { x: 200, y: 150 } // Adjust the y-coordinate to align nodes horizontally
  },
  {
    id: '3',
    type: 'default',
    data: { label: 'Node 3' },
    position: { x: 300, y: 200 }
  }
];

const initialEdges = [
  //   {
  //     id: 'edge-1-2',
  //     source: '1',
  //     target: '2',
  //     sourceHandle: 'c',
  //     targetHandle: 'a'
  //   },
  //   {
  //     id: 'edge-2-3',
  //     source: '2',
  //     target: '3'
  //   }
];

const generateNodesList = (list, constants, y) => {
  return list.map(item => {
    const { label, description } =
      constants.find(constant => constant.type === item.type) || {};
    const node = {
      id: item.id,
      data: { label, description },
      position: { x: 0, y }
    };

    y += 100;

    return node;
  });
};

const generateNodes = (
  automation: IAutomation,
  constants: AutomationConstants
) => {
  const { actions, triggers } = automation;

  const { actionsConst, triggersConst } = constants;

  let y = 0;

  const triggerNodes = generateNodesList(triggers, triggersConst, y);

  const actionNodes = generateNodesList(actions, actionsConst, y);

  return [...triggerNodes, ...actionNodes];
};

const generateEdges = (automation: IAutomation) => {
  const { actions, triggers } = automation;

  return actions.map(item => ({
    id: `${Math.random()}`,
    source: item.id,
    target: item.nextActionId || ''
  }));
};

function TestEditor({ automation, constants }: Props) {
  const [nodes, , onNodesChange] = useNodesState(
    generateNodes(automation, constants)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges(automation)
  );

  const onConnect = useCallback(
    params =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow }
          },
          eds
        )
      ),
    []
  );

  const onElementsRemove = useCallback(elementsToRemove => {
    console.log('dasda', elementsToRemove);
    // setEdges(prevElements =>
    //   prevElements.filter(element => !elementsToRemove.includes(element))
    // );
  }, []);

  return (
    <>
      {' '}
      fuck You
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onClickConnectEnd={onElementsRemove}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onElementsRemove}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </>
  );
}

export default TestEditor;
