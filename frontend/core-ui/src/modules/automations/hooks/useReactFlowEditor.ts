import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { useReactFlowEdges } from '@/automations/hooks/useReactFlowEdges';
import { NodeData } from '@/automations/types';
import { automationDropHandler } from '@/automations/utils/automationBuilderUtils/dropNodeHandler';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useRef } from 'react';

export const useReactFlowEditor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const editorWrapper = useRef<HTMLDivElement>(null);
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const theme = useAtomValue(themeState);
  const {
    awaitingToConnectNodeId,
    setAwaitingToConnectNodeId,
    reactFlowInstance,
    setReactFlowInstance,
    setQueryParams,
    actionFolks,
  } = useAutomation();
  const { triggers, actions, workflows, getList } = useAutomationNodes();
  const { getNodes, addNodes } = useReactFlow<Node<NodeData>>();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  const { onNodeDoubleClick } = useNodeEvents();
  const { isValidConnection, onConnect, onAwaitingNodeConnection } =
    useNodeConnect();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const { newNodeId, newNode, nodeType, generatedNode } =
      automationDropHandler({
        triggers,
        actions,
        workflows,
        event,
        reactFlowInstance,
        getNodes,
      });

    const listFieldName = AUTOMATION_NODE_TYPE_LIST_PROERTY[nodeType];

    // Update form state minimally
    setAutomationBuilderFormValue(listFieldName, [
      ...getList(nodeType),
      newNode,
    ]);

    if (newNodeId && generatedNode) {
      addNodes(generatedNode);
      if (awaitingToConnectNodeId) {
        onAwaitingNodeConnection(
          awaitingToConnectNodeId,
          newNodeId,
          generatedNode,
        );
      }
      setQueryParams({ activeNodeId: newNodeId });
    }

    if (nodes.find((node) => node.type === 'scratch')) {
      setNodes((nodes) => nodes.filter((node) => node.type !== 'scratch'));
    }
    if (awaitingToConnectNodeId) {
      setAwaitingToConnectNodeId('');
    }
  };

  // 1) Generate and set nodes when data changes
  useEffect(() => {
    const generatedNodes = generateNodes(triggers, actions, workflows);
    setNodes(generatedNodes);
  }, [triggers, actions, workflows]);

  // 2) Sync edges with memoization and rAF to avoid infinite loops and dropped edges
  useReactFlowEdges({
    triggers,
    actions,
    workflows,
    actionFolks,
    setEdges,
  });

  return {
    theme,
    nodes,
    edges,
    reactFlowWrapper,
    editorWrapper,
    onNodeDoubleClick,
    isValidConnection,
    onDragOver,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    setReactFlowInstance,
  };
};
