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
  const [pluginName, moduleName, recordName] = splitAutomationNodeType(
    activeSourceNode?.type || '',
  );

  const isCoreNode = isCoreAutomationNodeType(activeSourceNode?.type);
  const nodeType = isCoreNode
    ? activeSourceNode?.type || ''
    : `${pluginName}:${moduleName}.${recordName}`;

  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !activeSourceNode?.type,
      variables: {
        nodeType,
      },
      fetchPolicy: 'cache-first',
    },
  );

  const variables = data?.automationNodeOutput?.variables || [];
  const propertySource = data?.automationNodeOutput?.propertySource;
  const sourceNodeConfig =
    activeSourceNode?.nodeType === AutomationNodeType.Action
      ? actions.find((action) => action.id === activeSourceNode.id)?.config
      : triggers.find((trigger) => trigger.id === activeSourceNode?.id)?.config;

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
