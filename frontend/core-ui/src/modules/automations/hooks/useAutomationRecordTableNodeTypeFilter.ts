import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import {
  AutomationNodeType,
  ConstantsQueryResponse,
} from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';

const NODE_TYPE_QUERY_KEYS: Record<
  AutomationNodeType.Trigger | AutomationNodeType.Action,
  'triggerTypes' | 'actionTypes'
> = {
  [AutomationNodeType.Trigger]: 'triggerTypes',
  [AutomationNodeType.Action]: 'actionTypes',
};

export const useAutomationRecordTableNodeTypeFilter = (
  nodeType: AutomationNodeType.Action | AutomationNodeType.Trigger,
) => {
  const queryKey = NODE_TYPE_QUERY_KEYS[nodeType];
  const [queries, setQueries] = useMultiQueryState<{
    actionTypes?: string[];
    triggerTypes?: string[];
  }>(['actionTypes', 'triggerTypes']);
  const { data, loading, error } = useQuery<ConstantsQueryResponse>(
    AUTOMATION_CONSTANTS,
    {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-only',
    },
  );

  const queryValue = queries[queryKey] || [];

  const { triggersConst, actionsConst } = data?.automationConstants || {};

  const list =
    {
      [AutomationNodeType.Trigger]: triggersConst,
      [AutomationNodeType.Action]: actionsConst,
    }[nodeType] || [];

  return { queries, setQueries, list, queryValue, loading, error, queryKey };
};
