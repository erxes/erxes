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
import { ACCOUNTING_SYNC_DEAL_RULES_QUERY } from '../graphql/checkSyncedDeals';
import { AccountingDealRule } from '../types';

type AccountingSyncDealRulesQueryResult = {
  saleRules?: AccountingDealRule[];
  returnRules?: AccountingDealRule[];
};

const DEAL_RETURN_TYPE_LABELS = {
  delete: 'Устгах',
  fullTr: 'Бүтэн гүйлгээ',
  onlySale: 'Зөвхөн борлуулалт',
};

const getRuleLabel = (rule?: AccountingDealRule) =>
  rule?.value?.title || rule?.subId || rule?._id || 'Select rule';

const getRuleTypeLabel = (rule: AccountingDealRule) => {
  if (rule.code !== ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN) {
    return 'Sale';
  }

  const returnType = rule.value?.returnType;

  return returnType
    ? `Return / ${DEAL_RETURN_TYPE_LABELS[returnType]}`
    : 'Return';
};

const useAccountingCheckSyncedDealRules = () =>
  useQuery<AccountingSyncDealRulesQueryResult>(
    ACCOUNTING_SYNC_DEAL_RULES_QUERY,
    {
      variables: {
        saleCode: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL,
        returnCode: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN,
      },
    },
  );

const useApplyDealRuleFilter = () => {
  const [{ ruleId, boardId, pipelineId, stageId }, setQueries] =
    useMultiQueryState<{
      ruleId: string;
      boardId: string;
      pipelineId: string;
      stageId: string;
    }>(['ruleId', 'boardId', 'pipelineId', 'stageId']);

  return {
    ruleId,
    applyRule: (rule?: AccountingDealRule) => {
      setQueries({
        ruleId: rule?._id || null,
        boardId: boardId || rule?.value?.boardId || null,
        pipelineId: pipelineId || rule?.value?.pipelineId || null,
        stageId: stageId || rule?.value?.stageId || rule?.subId || null,
      });
    },
  };
};

const AccountingCheckSyncedDealRuleContent = ({
  onSelect,
}: {
  onSelect?: () => void;
}) => {
  const { data, loading } = useAccountingCheckSyncedDealRules();
  const { ruleId, applyRule } = useApplyDealRuleFilter();

  const rules = [...(data?.saleRules || []), ...(data?.returnRules || [])];

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

export const AccountingCheckSyncedDealRuleFilterItem = () => (
  <Filter.Item value="ruleId">
    <IconSettings />
    Rule
  </Filter.Item>
);

export const AccountingCheckSyncedDealRuleFilterView = () => {
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="ruleId">
      <AccountingCheckSyncedDealRuleContent onSelect={resetFilterState} />
    </Filter.View>
  );
};

export const AccountingCheckSyncedDealRuleFilterBar = () => {
  const [open, setOpen] = useState(false);
  const { data } = useAccountingCheckSyncedDealRules();
  const { ruleId } = useApplyDealRuleFilter();
  const rules = [...(data?.saleRules || []), ...(data?.returnRules || [])];
  const rule = rules.find((item) => item._id === ruleId);

  return (
    <Filter.BarItem queryKey="ruleId">
      <Filter.BarName>
        <IconSettings />
        Rule
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="ruleId">
            {getRuleLabel(rule)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <AccountingCheckSyncedDealRuleContent
            onSelect={() => setOpen(false)}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
