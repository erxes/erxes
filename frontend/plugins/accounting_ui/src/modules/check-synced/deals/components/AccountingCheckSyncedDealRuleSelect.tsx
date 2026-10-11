import { normalizeAccountingRule } from '@/check-synced/utils/accountingRules';
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
import i18n from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { ACCOUNTING_SYNC_DEAL_RULES_QUERY } from '../graphql/checkSyncedDeals';
import { AccountingDealRule } from '../types';

type AccountingSyncDealRulesQueryResult = {
  saleRules?: AccountingDealRule[];
  returnRules?: AccountingDealRule[];
  movementRules?: AccountingDealRule[];
};

export type AccountingCheckSyncedDealRuleScope = 'deal' | 'movement';

const DEAL_RETURN_TYPE_LABELS = {
  delete: 'Устгах',
  fullTr: 'Бүтэн гүйлгээ',
  onlySale: 'Зөвхөн борлуулалт',
};

const getRuleLabel = (rule?: AccountingDealRule) =>
  rule?.value?.title || rule?.subId || rule?._id || 'Select rule';

const getRuleTypeLabel = (rule: AccountingDealRule) => {
  if (rule.code !== ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN) {
    if (rule.code === ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT) {
      return 'Хөдөлгөөн';
    }

    return i18n.t('accounting:sale');
  }

  const returnType = rule.value?.returnType;

  return returnType
    ? `${i18n.t('accounting:return')} / ${DEAL_RETURN_TYPE_LABELS[returnType]}`
    : i18n.t('accounting:return');
};

const useAccountingCheckSyncedDealRules = () => {
  const result = useQuery(ACCOUNTING_SYNC_DEAL_RULES_QUERY, {
    variables: {
      saleCode: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL,
      returnCode: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN,
      movementCode: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT,
    },
  });
  return {
    ...result,
    data: result.data
      ? {
          saleRules: (result.data.saleRules ?? []).flatMap((config) =>
            config ? [normalizeAccountingRule(config)] : [],
          ),
          returnRules: (result.data.returnRules ?? []).flatMap((config) =>
            config ? [normalizeAccountingRule(config)] : [],
          ),
          movementRules: (result.data.movementRules ?? []).flatMap((config) =>
            config ? [normalizeAccountingRule(config)] : [],
          ),
        }
      : undefined,
  };
};

const getRulesByScope = (
  data: AccountingSyncDealRulesQueryResult | undefined,
  ruleScope: AccountingCheckSyncedDealRuleScope,
) => {
  if (ruleScope === 'movement') {
    return data?.movementRules || [];
  }

  return [...(data?.saleRules || []), ...(data?.returnRules || [])];
};

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
    applyRule: useCallback(
      (rule?: AccountingDealRule) => {
        setQueries({
          ruleId: rule?._id || null,
          boardId: boardId || rule?.value?.boardId || null,
          pipelineId: pipelineId || rule?.value?.pipelineId || null,
          stageId: stageId || rule?.value?.stageId || rule?.subId || null,
        });
      },
      [boardId, pipelineId, setQueries, stageId],
    ),
    clearRule: useCallback(() => {
      setQueries({
        ruleId: null,
      });
    }, [setQueries]),
  };
};

const AccountingCheckSyncedDealRuleContent = ({
  onSelect,
  ruleScope = 'deal',
}: {
  onSelect?: () => void;
  ruleScope?: AccountingCheckSyncedDealRuleScope;
}) => {
  const { t } = useTranslation('accounting');
  const { data, loading } = useAccountingCheckSyncedDealRules();
  const { ruleId, applyRule, clearRule } = useApplyDealRuleFilter();

  const rules = getRulesByScope(data, ruleScope);
  const hasSelectedRule = rules.some((rule) => rule._id === ruleId);

  useEffect(() => {
    if (!loading && ruleId && !hasSelectedRule) {
      clearRule();
    }
  }, [clearRule, hasSelectedRule, loading, ruleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-rule')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-rules-found')}</span>
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

export const AccountingCheckSyncedDealRulePicker = ({
  children,
  ruleScope = 'deal',
}: {
  children: ReactNode;
  ruleScope?: AccountingCheckSyncedDealRuleScope;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Combobox.Content>
        <AccountingCheckSyncedDealRuleContent
          onSelect={() => setOpen(false)}
          ruleScope={ruleScope}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const AccountingCheckSyncedDealRuleFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="ruleId">
      <IconSettings />
      {t('rule')}
    </Filter.Item>
  );
};

export const AccountingCheckSyncedDealRuleFilterView = ({
  ruleScope = 'deal',
}: {
  ruleScope?: AccountingCheckSyncedDealRuleScope;
}) => {
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="ruleId">
      <AccountingCheckSyncedDealRuleContent
        onSelect={resetFilterState}
        ruleScope={ruleScope}
      />
    </Filter.View>
  );
};

export const AccountingCheckSyncedDealRuleFilterBar = ({
  ruleScope = 'deal',
}: {
  ruleScope?: AccountingCheckSyncedDealRuleScope;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const { data, loading } = useAccountingCheckSyncedDealRules();
  const { ruleId, clearRule } = useApplyDealRuleFilter();
  const rules = getRulesByScope(data, ruleScope);
  const rule = rules.find((item) => item._id === ruleId);

  useEffect(() => {
    if (!loading && ruleId && !rule) {
      clearRule();
    }
  }, [clearRule, loading, rule, ruleId]);

  return (
    <Filter.BarItem queryKey="ruleId">
      <Filter.BarName>
        <IconSettings />
        {t('rule')}
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
            ruleScope={ruleScope}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
