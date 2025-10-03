import { useAutomation } from '@/automations/context/AutomationProvider';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { useTriggersActions } from '@/automations/hooks/useTriggersActions';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { Node, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { NodeData } from '../types';
import {
  automationDropHandler,
  generateEdges,
  generateNodes,
} from '../utils/automationBuilderUtils';

export const useReactFlowEditor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const editorWrapper = useRef<HTMLDivElement>(null);
  const theme = useAtomValue(themeState);
  const {
    awaitingToConnectNodeId,
    setAwaitingToConnectNodeId,
    reactFlowInstance,
    setReactFlowInstance,
  } = useAutomation();
  const { setValue } = useFormContext<TAutomationBuilderForm>();
  const { triggers, actions } = useTriggersActions();

  const [nodes, _setNodes, onNodesChange] = useNodesState<Node<NodeData>>(
    generateNodes(triggers, actions),
  );
  const [edges, _setEdges, onEdgesChange] = useEdgesState<any>(
    generateEdges(triggers, actions),
  );

  const { onNodeDoubleClick, onNodeDragStop } = useNodeEvents();
  const { isValidConnection, onConnect } = useNodeConnect();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const { actions: newActions, triggers: newTriggers } =
      automationDropHandler({
        triggers,
        actions,
        event,
        reactFlowInstance,
      }) || {};

    setValue('actions', newActions);
    setValue('triggers', newTriggers);

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
    onNodeDragStop,
    onDragOver,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    setReactFlowInstance,
  };
};
