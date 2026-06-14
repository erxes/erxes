import { useQuery } from '@apollo/client';
import { IconSettings } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useMultiQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { ACCOUNTING_SYNC_ORDER_RULES_QUERY } from '../graphql/checkSyncedOrders';
import { AccountingOrderRule } from '../types';

type AccountingSyncOrderRulesQueryResult = {
  accountingsConfigs?: AccountingOrderRule[];
};

const ORDER_RETURN_TYPE_LABELS = {
  delete: 'Устгах',
  fullTr: 'Бүтэн гүйлгээ',
  onlySale: 'Зөвхөн борлуулалт',
};

const getRuleLabel = (rule?: AccountingOrderRule) =>
  rule?.value?.title || rule?.subId || rule?._id || 'Select rule';

const getRuleTypeLabel = (rule: AccountingOrderRule) => {
  const returnType = rule.value?.returnType;

  return returnType
    ? `Sale / Return / ${ORDER_RETURN_TYPE_LABELS[returnType]}`
    : 'Sale / Return';
};

const useAccountingCheckSyncedOrderRules = () =>
  useQuery<AccountingSyncOrderRulesQueryResult>(
    ACCOUNTING_SYNC_ORDER_RULES_QUERY,
    {
      variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_ORDER },
    },
  );

const useApplyOrderRuleFilter = () => {
  const [{ orderRuleId, pos }, setQueries] = useMultiQueryState<{
    orderRuleId: string;
    pos: string;
  }>(['orderRuleId', 'pos']);

  return {
    ruleId: orderRuleId,
    applyRule: (rule?: AccountingOrderRule) => {
      setQueries({
        orderRuleId: rule?._id || null,
        pos: pos || rule?.value?.posId || rule?.subId || null,
      });
    },
  };
};

const AccountingCheckSyncedOrderRuleContent = ({
  onSelect,
}: {
  onSelect?: () => void;
}) => {
  const { data, loading } = useAccountingCheckSyncedOrderRules();
  const { ruleId, applyRule } = useApplyOrderRuleFilter();
  const rules = data?.accountingsConfigs || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search rule" />
      <Command.Empty>
        <span className="text-muted-foreground">No rules found</span>
      </Command.Empty>
      <Command.List>
        {rules.map((rule) => (
          <Command.Item
            key={rule._id}
            value={rule._id}
            onSelect={() => {
              applyRule(rule);
              onSelect?.();
            }}
          >
            <span className="flex flex-col">
              <span className="font-medium">{getRuleLabel(rule)}</span>
              <span className="text-xs text-muted-foreground">
                {getRuleTypeLabel(rule)}
              </span>
            </span>
            <Combobox.Check checked={ruleId === rule._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const AccountingCheckSyncedOrderRuleFilterItem = () => (
  <Filter.Item value="orderRuleId">
    <IconSettings />
    Rule
  </Filter.Item>
);

export const AccountingCheckSyncedOrderRuleFilterView = () => {
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="orderRuleId">
      <AccountingCheckSyncedOrderRuleContent onSelect={resetFilterState} />
    </Filter.View>
  );
};

export const AccountingCheckSyncedOrderRuleFilterBar = () => {
  const [open, setOpen] = useState(false);
  const { data } = useAccountingCheckSyncedOrderRules();
  const { ruleId } = useApplyOrderRuleFilter();
  const rule = data?.accountingsConfigs?.find((item) => item._id === ruleId);

  return (
    <Filter.BarItem queryKey="orderRuleId">
      <Filter.BarName>
        <IconSettings />
        Rule
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="orderRuleId">
            {getRuleLabel(rule)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <AccountingCheckSyncedOrderRuleContent
            onSelect={() => setOpen(false)}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
