import { IAction } from '@erxes/ui-automations/src/types';
import { Alert } from '@erxes/ui/src';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  getOutgoers,
  MiniMap,
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
import edgeTypes from './edges';
import ConnectionLine from './edges/ConnectionLine';
import Info from './Info';
import nodeTypes from './nodes';
import { generateEdges, generateNodes, generatePostion } from './utils';

type Props = {
  automation: IAutomation;
  triggers: ITrigger[];
  actions: IAction[];
  workFlowActions?: { workflowId: string; actions: IAction[] }[];
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
    awaitingNodeId
  }: {
    type: string;
    awaitingNodeId?: string;
  }) => void;
  onDoubleClick: (type: string, id: string) => void;
  removeItem: (type: string, id: string) => void;
  constants: AutomationConstants;
  onChangePositions: (type: string, id: string, postions: any) => void;
  addAction: (data: IAction, actionId?: string, config?: any) => void;
  handelSave: () => void;
  addWorkFlowAction: (workflowId: string, actions: IAction[]) => void;
  removeWorkFlowAction: (workflowId: string) => void;
};

const fitViewOptions = { padding: 4, minZoom: 0.8 };
function arraysAreNotIdentical(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return true;
  }
  return !arr1.every((value, index) => value === arr2[index]);
}

const onDisConnection = ({ nodes, edge, setEdges, onConnect }) => {
  setEdges(eds => eds.filter(e => e.id !== edge.id));
  let info: any = { source: edge.source, target: undefined };

  const sourceNode = nodes.find(n => n.id === edge.source);

  if (edge.sourceHandle.includes(sourceNode?.id)) {
    const [_action, _sourceId, optionalConnectId] = (edge.id || '').split('-');
    info.optionalConnectId = optionalConnectId;
    info.connectType = 'optional';
  }

  onConnect(info);
};

function AutomationEditor({
  triggers,
  actions,
  workFlowActions,
  onConnection,
  onChangePositions,
  ...props
}: Props) {
  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    generateNodes({ triggers, actions, workFlowActions }, props)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges({
      triggers,
      actions,
      workFlowActions,
      onDisconnect: edge =>
        onDisConnection({ nodes, edge, setEdges, onConnect })
    })
  );

  const [selectedNodes, setSelectedNodes] = useState([] as string[]);
  const [copiedNodes, setCopiedNodes] = useState([]) as any[];

  const resetNodes = () => {
    const updatedNodes: any[] = generateNodes(
      { triggers, actions, workFlowActions },
      props
    );

    const mergedArray = updatedNodes.map(node1 => {
      let node2 = nodes.find(o => o.id === node1.id);

      if (node2) {
        return { ...node1, position: { ...node1.position, ...node2.position } };
      }
      return node1;
    });
    setNodes(mergedArray);
    setEdges(
      generateEdges({
        triggers,
        actions,
        workFlowActions,
        onDisconnect: edge =>
          onDisConnection({ nodes, edge, setEdges, onConnect })
      })
    );
  };

  useEffect(() => {
    resetNodes();
  }, [
    JSON.stringify(triggers),
    JSON.stringify(actions),
    JSON.stringify(workFlowActions)
  ]);

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

    const targetWorkflow = workFlowActions?.find(({ actions }) =>
      actions.some(action => action.id === info.targetId)
    );
    if (targetWorkflow) {
      info.workflowId = targetWorkflow.workflowId;
    }

    const sourceWorkflow = workFlowActions?.find(({ actions }) =>
      actions.some(action => action.id === info.sourceId)
    );

    if (sourceWorkflow && info.targetId) {
      info.workflowId = sourceWorkflow.workflowId;
    }

    return info;
  };

  const onConnect = useCallback(
    params => {
      const source = nodes.find(node => node.id === params.source);
      setEdges(eds => {
        const updatedEdges = addEdge({ ...params }, eds);

        onConnection(generateConnect(params, source));

        return updatedEdges;
      });
    },
    [nodes]
  );

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges(els => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      onDisConnection({ nodes, edge, setEdges, onConnect });
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
        if (node?.dta?.nodeType === 'trigger') return true;
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target?.parentId && connection?.source && target.id) {
        const workflow = (workFlowActions || []).find(
          node => node.workflowId === target.parentId
        );

        if (
          workflow &&
          [connection?.source, target.id].every(id =>
            (workflow.actions || []).find(action => action.id === id)
          )
        ) {
          return false;
        }
      }

      return !hasCycle(target);
    },
    [nodes, edges]
  );

  const onPaneClick = () => {
    if (props.showDrawer) {
      props.toggleDrawer({ type: '' });
    }
  };

  const onNodesSelectionChange = ({ nodes }) => {
    if (
      arraysAreNotIdentical(
        selectedNodes,
        nodes.map(node => node.id)
      )
    ) {
      setSelectedNodes(nodes.map(node => node.id));
    }
  };

  const onNodeDragStop = (_, node) => {
    onChangePositions(node?.data?.nodeType, node.id, node.position);
  };

  const onDoubleClickEdge = (_, edge) => {
    onDisConnection({ nodes, edge, onConnect, setEdges });
  };

  const copyNodes = () => {
    setCopiedNodes(selectedNodes);
  };

  const pasteNodes = () => {
    if (props.showDrawer) {
      Alert.warning('Please hide drawer before paste');
      return;
    }
    const copyPastedActions = actions.filter(action =>
      copiedNodes.includes(action.id)
    );

    for (const action of copyPastedActions) {
      delete action.nextActionId;
      delete action.config?.optionalConnects;

      action.position = generatePostion(action.position);

      props.addAction(action);
    }
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'c':
            copyNodes();
            break;
          case 'v':
            pasteNodes();
            break;
          case 'S':
            props.handelSave();
            break;
          default:
            break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, copiedNodes]);

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
        onEdgeDoubleClick={onDoubleClickEdge}
        onSelectionChange={onNodesSelectionChange}
        connectionLineComponent={ConnectionLine}
        minZoom={0.1}
        edgeTypes={edgeTypes}
      >
        <MiniMap pannable position="top-right" />
        <Controls>
          <Info />
        </Controls>
        <Background />
      </ReactFlow>
    </>
  );
}

export default AutomationEditor;
