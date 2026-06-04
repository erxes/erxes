import { useQuery } from '@apollo/client';
import { Select, useQueryState } from 'erxes-ui';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { ACCOUNTING_SYNC_ORDER_RULES_QUERY } from '../graphql/checkSyncedOrders';
import { AccountingOrderRule } from '../types';

type AccountingSyncOrderRulesQueryResult = {
  accountingsConfigs?: AccountingOrderRule[];
};

export const AccountingCheckSyncedOrderRuleSelect = () => {
  const [ruleId, setRuleId] = useQueryState<string>('orderRuleId');
  const [, setPos] = useQueryState<string>('pos');
  const { data, loading } = useQuery<AccountingSyncOrderRulesQueryResult>(
    ACCOUNTING_SYNC_ORDER_RULES_QUERY,
    {
      variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_ORDER },
    },
  );

  const rules = data?.accountingsConfigs || [];

  return (
    <Select
      value={ruleId || ''}
      onValueChange={(selectedRuleId) => {
        const rule = rules.find((item) => item._id === selectedRuleId);

        setRuleId(selectedRuleId);
        setPos(rule?.value?.posId || rule?.subId || '');
      }}
      disabled={loading}
    >
      <Select.Trigger className="w-64">
        <Select.Value
          placeholder={loading ? 'Loading rules...' : 'Select POS rule'}
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
