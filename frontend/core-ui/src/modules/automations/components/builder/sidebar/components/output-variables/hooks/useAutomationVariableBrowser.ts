import { WORKFLOW_INPUT_NODE_ID } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import { AutomationNodeType } from '@/automations/types';
import { useDeferredValue, useEffect, useState } from 'react';
import {
  TAutomationVariableBrowserProps,
  TAutomationVariablePayloadArgs,
} from '../AutomationVariableBrowserTypes';
import {
  buildAutomationVariablePath,
  buildAutomationVariablePayload,
  buildAutomationVariableToken,
} from '../utils/automationVariablePathUtils';
import { useAutomationNodeOutput } from './useAutomationNodeOutput';

export const useAutomationVariableBrowser = ({
  sourceNode,
  sourceNodes,
}: Pick<TAutomationVariableBrowserProps, 'sourceNode' | 'sourceNodes'>) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState(
    sourceNodes?.[0]?.id || '',
  );

  useEffect(() => {
    if (!sourceNodes?.length) {
      setSelectedSourceNodeId('');
      return;
    }

    const hasSelectedNode = sourceNodes.some(
      (node) => node.id === selectedSourceNodeId,
    );

    if (!hasSelectedNode) {
      setSelectedSourceNodeId(sourceNodes[0].id);
    }
  }, [selectedSourceNodeId, sourceNodes]);

  const activeSourceNode = sourceNodes?.length
    ? sourceNodes.find((node) => node.id === selectedSourceNodeId) ||
      sourceNodes[0]
    : sourceNode || null;

  const { loading, mergedVariables, mergedPropertySource } =
    useAutomationNodeOutput(activeSourceNode);

  const deferredSearchValue = useDeferredValue(searchValue);
  const searchQuery = deferredSearchValue.trim().toLowerCase();

  const isActiveSourceNodeTrigger =
    activeSourceNode?.nodeType === AutomationNodeType.Trigger;
  const isActiveSourceNodeAction =
    activeSourceNode?.nodeType === AutomationNodeType.Action;
  const isActiveSourceNodeInput =
    activeSourceNode?.id === WORKFLOW_INPUT_NODE_ID;

  const scope = isActiveSourceNodeInput
    ? 'input'
    : isActiveSourceNodeTrigger
      ? 'trigger'
      : isActiveSourceNodeAction
        ? `actions.${activeSourceNode.id}`
        : '';

  const buildVariablePath = (path: string) =>
    buildAutomationVariablePath(scope, path);

  const buildVariableToken = (path: string) =>
    buildAutomationVariableToken(scope, path);

  const buildVariablePayload = ({
    key,
    label,
    path,
    token,
  }: TAutomationVariablePayloadArgs) =>
    buildAutomationVariablePayload({
      activeSourceNode,
      key,
      label,
      path,
      token,
    });

  return {
    activeSourceNode,
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    loading,
    mergedVariables,
    mergedPropertySource,
    searchQuery,
    searchValue,
    selectedSourceNodeId,
    setSearchValue,
    setSelectedSourceNodeId,
  };
};
