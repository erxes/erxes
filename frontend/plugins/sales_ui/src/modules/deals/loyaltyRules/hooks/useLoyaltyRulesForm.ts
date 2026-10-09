import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { LOYALTY_RULE_TYPES, TLoyaltyRuleType } from '../constants';
import {
  SALES_LOYALTY_RULES,
  SALES_LOYALTY_RULES_SAVE,
} from '../graphql/loyaltyRulesQueries';
import {
  loyaltyRulesFormSchema,
  TLoyaltyRule,
  TLoyaltyRuleRow,
  TLoyaltyRulesForm,
} from '../types';

const toRow = (rule: TLoyaltyRule): TLoyaltyRuleRow => ({
  _id: rule._id,
  type: rule.type,
  scoreCampaignId: rule.scoreCampaignId,
  boardId: rule.boardId || undefined,
  pipelineId: rule.pipelineId || undefined,
  earnProbability: rule.earn?.probability || undefined,
  refundProbability: rule.refund?.probability || undefined,
  earnStageIds: rule.earn?.stageIds || [],
  refundStageIds: rule.refund?.stageIds || [],
});

// Stages are named by id only inside one pipeline, by probability elsewhere.
const toInput = (row: TLoyaltyRuleRow) => {
  const specific = row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;

  return {
    _id: row._id,
    type: row.type,
    scoreCampaignId: row.scoreCampaignId,
    boardId: row.type === LOYALTY_RULE_TYPES.EVERY_BOARD ? null : row.boardId,
    pipelineId: specific ? row.pipelineId : null,
    earn: specific
      ? { stageIds: row.earnStageIds }
      : { probability: row.earnProbability },
    refund: specific
      ? { stageIds: row.refundStageIds }
      : { probability: row.refundProbability || null },
  };
};

const emptyRow = (type: TLoyaltyRuleType): TLoyaltyRuleRow => ({
  type,
  scoreCampaignId: '',
  earnProbability:
    type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES ? undefined : 'Won',
  refundProbability:
    type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES ? undefined : 'Lost',
  earnStageIds: [],
  refundStageIds: [],
});

/** The whole points configuration, edited in the dialog and saved at once. */
export const useLoyaltyRulesForm = (open: boolean) => {
  const { data, loading, error } = useQuery<{
    salesLoyaltyRules: TLoyaltyRule[];
  }>(SALES_LOYALTY_RULES, { skip: !open, fetchPolicy: 'cache-and-network' });

  const form = useForm<TLoyaltyRulesForm>({
    resolver: zodResolver(loyaltyRulesFormSchema),
    defaultValues: { rules: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rules',
    keyName: 'key',
  });

  const rules = data?.salesLoyaltyRules;

  useEffect(() => {
    if (open && rules) {
      form.reset({ rules: rules.map(toRow) });
    }
  }, [open, rules, form]);

  const [saveRules, { loading: saving }] = useMutation(
    SALES_LOYALTY_RULES_SAVE,
    {
      refetchQueries: ['SalesLoyaltyRules', 'SalesStageLoyaltyPoints'],
      awaitRefetchQueries: true,
    },
  );

  return {
    form,
    fields,
    loading: loading && !rules,
    error,
    saving,
    add: (type: TLoyaltyRuleType) => append(emptyRow(type)),
    remove,
    save: ({ rules: rows }: TLoyaltyRulesForm) =>
      saveRules({ variables: { rules: rows.map(toInput) } }),
  };
};
