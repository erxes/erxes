import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import { useDnDActions } from '@/automations/context/AutomationBuilderDnDProvider';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useInsertWorkflowTemplate } from '@/automations/components/builder/hooks/useInsertWorkflowTemplate';
import { WORKFLOW_INPUT_NODE_ID } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { AutomationNodeType, NodeData } from '@/automations/types';
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
  const { insertTemplate } = useInsertWorkflowTemplate();
  const { getNodes, addNodes } = useReactFlow<Node<NodeData>>();
  const [edgeType, flowDirection] = useWatch<TAutomationBuilderForm>({
    name: ['edgeType', 'flowDirection'],
  });

  const workflowEditScope = useWorkflowEditScope();

  const entryActionId = useMemo(() => {
    if (!workflowEditScope || !actions.length) {
      return undefined;
    }

    return actions.some(({ id }) => id === workflowEditScope.entryActionId)
      ? workflowEditScope.entryActionId
      : actions[0].id;
  }, [workflowEditScope, actions]);

  // Memoize nodes and edges generation to prevent multiple executions
  const generatedNodes = useMemo(() => {
    // Inside a workflow with no members yet: show only the Input marker. A
    // workflow has no trigger, so never fall back to the trigger placeholder.
    if (workflowEditScope && actions.length === 0) {
      return [
        {
          id: WORKFLOW_INPUT_NODE_ID,
          type: 'workflowInput',
          position: { x: 0, y: 0 },
          data: {},
        },
      ] as Node<NodeData>[];
    }

    const nodes = generateNodes(
      triggers,
      actions,
      workflows,
      {},
      flowDirection,
    );

    // Inside a workflow the trigger slot is taken by the Input marker
    const entryNode = entryActionId
      ? nodes.find(({ id }) => id === entryActionId)
      : undefined;

    if (entryNode) {
      nodes.push({
        id: WORKFLOW_INPUT_NODE_ID,
        type: 'workflowInput',
        position: {
          x: entryNode.position.x - 260,
          y: entryNode.position.y,
        },
        data: {},
      });
    }

    return nodes;
  }, [
    triggers,
    actions,
    workflows,
    flowDirection,
    entryActionId,
    workflowEditScope,
  ]);

  const computedEdges = useMemo(() => {
    const edges = generateEdges(
      triggers,
      actions,
      workflows,
      actionFolks,
      edgeType,
      flowDirection,
    );

    if (entryActionId) {
      edges.push({
        id: `${WORKFLOW_INPUT_NODE_ID}-edge`,
        source: WORKFLOW_INPUT_NODE_ID,
        target: entryActionId,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'primary',
        style: { strokeWidth: 2 },
        data: { edgeType, flowDirection },
      });
    }

    return edges;
  }, [
    triggers,
    actions,
    workflows,
    actionFolks,
    edgeType,
    flowDirection,
    entryActionId,
  ]);

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
      // React portals propagate synthetic events through the REACT tree, so
      // drag events inside the workflow sheet would bubble to the main
      // canvas' handlers too.
      event.stopPropagation();
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
        globalThis.clearTimeout(dragOverTimeoutRef.current);
      }

      dragOverTimeoutRef.current = window.setTimeout(() => {
        setCanvasOver(false);
      }, 120);
    },
    [setCanvasOver, updateCursor],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    try {
      // Same portal-bubbling issue as onDragOver: without this a drop inside
      // the workflow sheet also fires the main canvas' onDrop, creating the
      // node twice.
      event.stopPropagation();

      if (dragOverTimeoutRef.current) {
        globalThis.clearTimeout(dragOverTimeoutRef.current);
      }

      const draggingNode = JSON.parse(
        event.dataTransfer.getData('application/reactflow/draggingNode') ||
          '{}',
      );

      // Workflows accept only actions: no triggers, no nested workflows
      if (
        workflowEditScope &&
        draggingNode.nodeType !== AutomationNodeType.Action
      ) {
        return;
      }

      // Workflow templates carry their whole snapshot and insert themselves
      if (
        draggingNode.nodeType === AutomationNodeType.Workflow &&
        draggingNode.template
      ) {
        event.preventDefault();

        insertTemplate(
          draggingNode.template,
          reactFlowInstance?.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
        );

        return;
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

      if (nodes.some((node) => node.type === 'scratch')) {
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
        globalThis.clearTimeout(dragOverTimeoutRef.current);
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
