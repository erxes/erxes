import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import { useDnDActions } from '@/automations/context/AutomationBuilderDnDProvider';
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
// @ts-ignore
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

export const useReactFlowEditor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const editorWrapper = useRef<HTMLDivElement>(null);
  const dragOverTimeoutRef = useRef<number | null>(null);
  const dragCursorFrameRef = useRef<number | null>(null);
  const latestDragCursorRef = useRef<{ x: number; y: number } | null>(null);
  const { setAutomationBuilderFormValue, syncPositionUpdates } =
    useAutomationFormController();
  const { updateCursor, setCanvasOver, reset } = useDnDActions();

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
  const [edgeType, flowDirection] = useWatch<TAutomationBuilderForm>({
    name: ['edgeType', 'flowDirection'],
  });

  // Memoize nodes and edges generation to prevent multiple executions
  const generatedNodes = useMemo(
    () => generateNodes(triggers, actions, workflows, {}, flowDirection),
    [triggers, actions, workflows, flowDirection],
  );

  const computedEdges = useMemo(
    () =>
      generateEdges(
        triggers,
        actions,
        workflows,
        actionFolks,
        edgeType,
        flowDirection,
      ),
    [triggers, actions, workflows, actionFolks, edgeType, flowDirection],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(
    generatedNodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(
    computedEdges || [],
  );

  const { onNodeClick, onNodeDoubleClick, onPaneClick } = useNodeEvents();
  const { isValidConnection, onConnect, onAwaitingNodeConnection } =
    useNodeConnect();

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      latestDragCursorRef.current = { x: event.clientX, y: event.clientY };
      if (dragCursorFrameRef.current === null) {
        dragCursorFrameRef.current = window.requestAnimationFrame(() => {
          dragCursorFrameRef.current = null;
          updateCursor(latestDragCursorRef.current);
        });
      }
      setCanvasOver(true);

      if (dragOverTimeoutRef.current) {
        window.clearTimeout(dragOverTimeoutRef.current);
      }

      dragOverTimeoutRef.current = window.setTimeout(() => {
        setCanvasOver(false);
      }, 120);
    },
    [setCanvasOver, updateCursor],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    try {
      if (dragOverTimeoutRef.current) {
        window.clearTimeout(dragOverTimeoutRef.current);
      }

      const { newNodeId, newNode, nodeType, generatedNode } =
        automationDropHandler({
          triggers,
          actions,
          workflows,
          event,
          reactFlowInstance,
          getNodes,
          flowDirection,
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
    } finally {
      setCanvasOver(false);
      reset();
    }
  };

  useEffect(() => {
    setNodes(generatedNodes);
  }, [generatedNodes, setNodes]);

  useEffect(() => {
    setEdges(computedEdges);
  }, [computedEdges, setEdges]);

  useEffect(() => {
    return () => {
      if (dragOverTimeoutRef.current) {
        window.clearTimeout(dragOverTimeoutRef.current);
      }
      if (dragCursorFrameRef.current) {
        window.cancelAnimationFrame(dragCursorFrameRef.current);
      }
    };
  }, []);

  const onNodeDragStop = useCallback(() => {
    syncPositionUpdates({
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [syncPositionUpdates]);

  return {
    theme,
    nodes,
    edges,
    edgeType,
    flowDirection,
    reactFlowWrapper,
    editorWrapper,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    isValidConnection,
    onDragOver,
    onNodeDragStop,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    setReactFlowInstance,
  };
};
