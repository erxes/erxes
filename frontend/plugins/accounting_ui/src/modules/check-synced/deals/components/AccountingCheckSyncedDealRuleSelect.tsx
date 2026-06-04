import { useQuery } from '@apollo/client';
import { Select, useQueryState } from 'erxes-ui';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { ACCOUNTING_SYNC_DEAL_RULES_QUERY } from '../graphql/checkSyncedDeals';
import { AccountingDealRule } from '../types';

type AccountingSyncDealRulesQueryResult = {
  accountingsConfigs?: AccountingDealRule[];
};

export const AccountingCheckSyncedDealRuleSelect = () => {
  const [ruleId, setRuleId] = useQueryState<string>('ruleId');
  const [, setBoardId] = useQueryState<string>('boardId');
  const [, setPipelineId] = useQueryState<string>('pipelineId');
  const [, setStageId] = useQueryState<string>('stageId');
  const { data, loading } = useQuery<AccountingSyncDealRulesQueryResult>(
    ACCOUNTING_SYNC_DEAL_RULES_QUERY,
    {
      variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL },
    },
  );

  const rules = data?.accountingsConfigs || [];

  return (
    <Select
      value={ruleId || ''}
      onValueChange={(selectedRuleId) => {
        const rule = rules.find((item) => item._id === selectedRuleId);

        setRuleId(selectedRuleId);
        setBoardId(rule?.value?.boardId || '');
        setPipelineId(rule?.value?.pipelineId || '');
        setStageId(rule?.value?.stageId || rule?.subId || '');
      }}
      disabled={loading}
    >
      <Select.Trigger className="w-64">
        <Select.Value
          placeholder={loading ? 'Loading rules...' : 'Select rule'}
        />
      </Select.Trigger>
      <Select.Content>
        {rules.map((rule) => (
          <Select.Item key={rule._id} value={rule._id}>
            {rule.value?.title || rule.subId || rule._id}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
