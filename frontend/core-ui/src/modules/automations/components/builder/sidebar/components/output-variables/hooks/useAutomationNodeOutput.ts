import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  TAutomationNodeOutputResponse,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';
import { splitAutomationNodeType } from 'ui-modules/modules/automations';
import {
  isCoreAutomationNodeType,
  useAutomationCoreNodeOutput,
} from './useAutomationCoreNodeOutput';

export const useAutomationNodeOutput = (
  activeSourceNode: TAutomationVariableSourceNode | null,
) => {
  const { actions, triggers } = useAutomationNodes();
  const sourceNodeConfig =
    activeSourceNode?.nodeType === AutomationNodeType.Action
      ? actions.find((action) => action.id === activeSourceNode.id)?.config
      : triggers.find((trigger) => trigger.id === activeSourceNode?.id)?.config;

  // The config lets a plugin add variables it decides (a form's fields)
  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !activeSourceNode?.type,
      variables: {
        nodeType: activeSourceNode?.type || '',
        config: isCoreAutomationNodeType(activeSourceNode?.type)
          ? null
          : sourceNodeConfig || null,
      },
      fetchPolicy: 'cache-first',
    },
  );

  const variables = data?.automationNodeOutput?.variables || [];
  const propertySource = data?.automationNodeOutput?.propertySource;

  const { coreVariables, corePropertySource } = useAutomationCoreNodeOutput({
    activeSourceNode,
    sourceNodeConfig,
    variables,
    propertySource,
  });

  // Pseudo sources (workflow inputs) provide their variables directly
  const mergedVariables = activeSourceNode?.staticVariables?.length
    ? activeSourceNode.staticVariables
    : coreVariables.filter(
        (variable, index, array) =>
          array.findIndex((candidate) => candidate.key === variable.key) ===
          index,
      );

  return {
    loading,
    mergedVariables,
    mergedPropertySource: corePropertySource,
  };
};
