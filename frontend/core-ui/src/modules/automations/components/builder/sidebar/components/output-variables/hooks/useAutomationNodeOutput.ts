import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  TAutomationNodeOutputResponse,
  TAutomationOutputPropertySource,
  TAutomationOutputVariable,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';

export const useAutomationNodeOutput = (
  activeSourceNode: TAutomationVariableSourceNode | null,
) => {
  const { findObjectTargetsConst } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !activeSourceNode?.type,
      variables: {
        nodeType: activeSourceNode?.type || '',
      },
      fetchPolicy: 'cache-first',
    },
  );

  const variables = data?.automationNodeOutput?.variables || [];
  const propertySources = data?.automationNodeOutput?.propertySources || [];
  const sourceNodeConfig =
    activeSourceNode?.nodeType === AutomationNodeType.Action
      ? actions.find((action) => action.id === activeSourceNode.id)?.config
      : triggers.find((trigger) => trigger.id === activeSourceNode?.id)?.config;

  const findObjectTarget =
    activeSourceNode?.nodeType === AutomationNodeType.Action &&
    activeSourceNode?.type === 'findObject'
      ? findObjectTargetsConst.find(
          (target: any) => target.value === sourceNodeConfig?.objectType,
        )
      : null;

  const findObjectVariables =
    findObjectTarget?.output?.variables?.map(
      (variable: TAutomationOutputVariable) => ({
        ...variable,
        key: `object.${variable.key}`,
        label: `${findObjectTarget.label} ${variable.label}`,
      }),
    ) || [];

  const findObjectPropertySources =
    findObjectTarget?.output?.propertySources?.map(
      (source: TAutomationOutputPropertySource) => ({
        ...source,
        key: `object.${source.key}`,
        label: `${findObjectTarget.label} ${source.label}`,
      }),
    ) || [];

  const mergedVariables = [...variables, ...findObjectVariables].filter(
    (variable, index, array) =>
      array.findIndex((candidate) => candidate.key === variable.key) === index,
  );

  const mergedPropertySources = [
    ...propertySources,
    ...findObjectPropertySources,
  ].filter(
    (source, index, array) =>
      array.findIndex((candidate) => candidate.key === source.key) === index,
  );

  return {
    loading,
    mergedVariables,
    mergedPropertySources,
  };
};
