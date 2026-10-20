import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { TAutomationNodeOutputResponse } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { useQuery } from '@apollo/client';
import { useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

type TRememberConfig = { as?: string; fields?: string[] };

// One action behind a tool: which of its output keys the agent keeps. Keys
// the action remembers by default behind an agent are always kept.
export const useAiAgentToolMemorizeFields = ({
  index,
  action,
}: {
  index: number;
  action: TAutomationAction;
}) => {
  const { control, setValue } = useFormContext<TAiAgentConfigForm>();
  const { actionConstMap } = useAutomation();
  const memorizeFields =
    useWatch({ control, name: `tools.${index}.memorizeFields` }) || [];
  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    { variables: { nodeType: action.type }, fetchPolicy: 'cache-first' },
  );

  const variables = (data?.automationNodeOutput?.variables || []).filter(
    ({ exposure }) => exposure !== 'reference',
  );
  const remember = actionConstMap
    .get(action.type)
    ?.defaultsWhenAfter?.find(({ actionType }) => actionType === 'aiAgent')
    ?.config?.remember as TRememberConfig | undefined;
  const alwaysKeys = new Set(['_id', ...(remember?.fields || [])]);
  const isAlways = (key: string) => alwaysKeys.has(key);
  const isChecked = (key: string) =>
    isAlways(key) ||
    memorizeFields.some(
      (field) => field.actionId === action.id && field.key === key,
    );

  const toggle = (key: string, checked: boolean) => {
    const rest = memorizeFields.filter(
      (field) => !(field.actionId === action.id && field.key === key),
    );

    setValue(
      `tools.${index}.memorizeFields`,
      checked ? [...rest, { actionId: action.id, key }] : rest,
      { shouldDirty: true },
    );
  };

  return {
    loading,
    variables,
    remembersRecord: !!remember?.as,
    isChecked,
    isAlways,
    toggle,
  };
};
