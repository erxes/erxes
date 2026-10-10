import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { LOYALTY_RULE_TYPES, TLoyaltyRuleType } from '../constants';
import {
  SALES_LOYALTY_TIER_RULES,
  SALES_LOYALTY_TIER_RULES_SAVE,
} from '../graphql/loyaltyRulesQueries';
import { toTierBands } from '../tierBands';
import {
  loyaltyTierRulesFormSchema,
  TLoyaltyTierRule,
  TLoyaltyTierRuleRow,
  TLoyaltyTierRulesForm,
} from '../types';

const toRow = (rule: TLoyaltyTierRule): TLoyaltyTierRuleRow => ({
  _id: rule._id,
  type: rule.type,
  accountTypeId: rule.accountTypeId,
  bands: toTierBands(rule.bands),
  onlyUpgrade: !!rule.onlyUpgrade,
  boardId: rule.boardId || undefined,
  pipelineId: rule.pipelineId || undefined,
  earnProbability: rule.earn?.probability || undefined,
  earnStageIds: rule.earn?.stageIds || [],
});

const toInput = (row: TLoyaltyTierRuleRow) => {
  const specific = row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;

  return {
    _id: row._id,
    type: row.type,
    accountTypeId: row.accountTypeId,
    bands: row.bands,
    onlyUpgrade: row.onlyUpgrade,
    boardId: row.type === LOYALTY_RULE_TYPES.EVERY_BOARD ? null : row.boardId,
    pipelineId: specific ? row.pipelineId : null,
    earn: specific
      ? { stageIds: row.earnStageIds }
      : { probability: row.earnProbability },
  };
};

const emptyRow = (type: TLoyaltyRuleType): TLoyaltyTierRuleRow => ({
  type,
  accountTypeId: '',
  bands: [],
  onlyUpgrade: true,
  earnProbability:
    type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES ? undefined : 'Won',
  earnStageIds: [],
});

/** Where deals set a tier, edited beside the points rules. */
export const useLoyaltyTierRulesForm = (open: boolean, enabled: boolean) => {
  const { data, loading, error } = useQuery<{
    salesLoyaltyTierRules: TLoyaltyTierRule[];
  }>(SALES_LOYALTY_TIER_RULES, {
    skip: !open || !enabled,
    fetchPolicy: 'cache-and-network',
  });

  const form = useForm<TLoyaltyTierRulesForm>({
    resolver: zodResolver(loyaltyTierRulesFormSchema),
    defaultValues: { rules: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rules',
    keyName: 'key',
  });

  const rules = data?.salesLoyaltyTierRules;

  useEffect(() => {
    if (open && rules) {
      form.reset({ rules: rules.map(toRow) });
    }
  }, [open, rules, form]);

  const [saveRules, { loading: saving }] = useMutation(
    SALES_LOYALTY_TIER_RULES_SAVE,
    {
      refetchQueries: ['SalesLoyaltyTierRules', 'SalesStageLoyaltyPoints'],
      awaitRefetchQueries: true,
    },
  );

  return {
    form,
    fields,
    loading: enabled && loading && !rules,
    error,
    saving,
    add: (type: TLoyaltyRuleType) => append(emptyRow(type)),
    remove,
    save: ({ rules: rows }: TLoyaltyTierRulesForm) =>
      saveRules({ variables: { rules: rows.map(toInput) } }),
  };
};
