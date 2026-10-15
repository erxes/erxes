import {
  TConditionProperty,
  toFieldProperties,
  toVariableProperties,
} from '@/automations/components/builder/sidebar/components/content/action/conditional/conditionProperties';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useAutomationNodeOutput } from '@/automations/components/builder/sidebar/components/output-variables/hooks/useAutomationNodeOutput';
import { buildAutomationVariableToken } from '@/automations/components/builder/sidebar/components/output-variables/utils/automationVariablePathUtils';
import { WORKFLOW_INPUT_NODE_ID } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import { AutomationNodeType } from '@/automations/types';
import { useMemo } from 'react';
import { useGetFieldsProperties } from 'ui-modules';

export const getConditionSourceScope = (
  node: TAutomationVariableSourceNode | null,
) => {
  if (!node) {
    return '';
  }

  if (node.id === WORKFLOW_INPUT_NODE_ID) {
    return 'input';
  }

  return node.nodeType === AutomationNodeType.Trigger
    ? 'trigger'
    : `actions.${node.id}`;
};

/**
 * Everything a condition can test on one source: its output variables and,
 * for a trigger, the record's own fields with the inputs Manage properties
 * would show for them.
 */
export const useConditionSourceProperties = (
  node: TAutomationVariableSourceNode | null,
) => {
  const { loading, mergedVariables } = useAutomationNodeOutput(node);
  const isTrigger = node?.nodeType === AutomationNodeType.Trigger;
  const recordType = isTrigger ? node?.type : undefined;
  const { fields, loading: fieldsLoading } = useGetFieldsProperties(
    recordType,
    { source: 'automations', sourceType: recordType },
  );
  const scope = getConditionSourceScope(node);

  const properties = useMemo<TConditionProperty[]>(() => {
    if (!node) {
      return [];
    }

    const tokenOf = (path: string) => buildAutomationVariableToken(scope, path);
    const fieldProperties = recordType
      ? toFieldProperties(fields, recordType, tokenOf)
      : [];
    const variableProperties = toVariableProperties(mergedVariables, tokenOf);
    const seen = new Set(fieldProperties.map(({ token }) => token));

    // A record field carries its own input, so it wins over the plain variable
    return [
      ...fieldProperties,
      ...variableProperties.filter(({ token }) => !seen.has(token)),
    ];
  }, [node, scope, recordType, fields, mergedVariables]);

  return { properties, loading: loading || fieldsLoading };
};
