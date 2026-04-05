import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { AutomationNodeType } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useDeferredValue, useState } from 'react';

export type TAutomationOutputVariable = {
  key: string;
  label: string;
  exposure?: 'placeholder' | 'reference';
};

export type TAutomationOutputPropertySource = {
  key: string;
  label: string;
  propertyType: string;
};

type TAutomationNodeOutput = {
  variables?: TAutomationOutputVariable[];
  propertySources?: TAutomationOutputPropertySource[];
};

type TAutomationNodeOutputResponse = {
  automationNodeOutput: TAutomationNodeOutput | null;
};

export const useAutomationBuilderSecondarySidebar = () => {
  const { selectedNode } = useAutomation();
  const [searchValue, setSearchValue] = useState('');
  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !selectedNode?.type,
      variables: {
        nodeType: selectedNode?.type || '',
      },
      fetchPolicy: 'cache-first',
    },
  );

  const deferredSearchValue = useDeferredValue(searchValue);
  const normalizedSearchValue = deferredSearchValue.trim().toLowerCase();
  const variables = data?.automationNodeOutput?.variables || [];
  const scope =
    selectedNode?.nodeType === AutomationNodeType.Trigger
      ? 'trigger'
      : selectedNode?.nodeType === AutomationNodeType.Action
        ? `actions.${selectedNode.id}`
        : '';

  const buildVariablePath = (path: string) =>
    scope ? `${scope}.${path}` : path;
  const buildVariableToken = (path: string) =>
    `{{ ${buildVariablePath(path)} }}`;
  const filteredVariables = !normalizedSearchValue
    ? variables
    : variables.filter((variable) =>
        `${variable.label} ${variable.key}`
          .toLowerCase()
          .includes(normalizedSearchValue),
      );

  return {
    selectedNode,
    loading,
    searchValue,
    setSearchValue,
    searchQuery: normalizedSearchValue,
    variables: filteredVariables,
    propertySources: data?.automationNodeOutput?.propertySources || [],
    buildVariablePath,
    buildVariableToken,
  };
};
