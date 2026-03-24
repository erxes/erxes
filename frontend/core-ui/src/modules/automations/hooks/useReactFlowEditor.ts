import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
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
import React, { useCallback, useMemo, useRef } from 'react';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';

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

  // Memoize nodes and edges generation to prevent multiple executions
  const generatedNodes = useMemo(
    () => generateNodes(triggers, actions, workflows),
    [triggers, actions, workflows],
  );

  const computedEdges = useMemo(
    () => generateEdges(triggers, actions, workflows, actionFolks),
    [triggers, actions, workflows, actionFolks],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(
    generatedNodes || [],
  );
  const [edges, _setEdges, onEdgesChange] = useEdgesState<any>(
    computedEdges || [],
  );

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
