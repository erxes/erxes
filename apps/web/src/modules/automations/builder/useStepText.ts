import type { AutomationStep, AutomationTrigger, ConditionGroup } from '@erxes/core-contract';
import { memberQueries, productSearchQueries } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { isRule, useMemberOptions, useProductOptions, useTagOptions } from 'erxes-ui';
import { useContext } from 'react';
import { z } from 'zod';
import { useLeadStages } from '~/modules/leads/useLeads';
import { tagsQuery } from '~/modules/tags/useTags';
import { automationsQuery } from '../automationQueries';
import { BuilderContext } from './BuilderContext';
import { useRecordChoices } from './ConditionsEditor';
import { describeStep, describeTrigger, triggerConditions } from './flowText';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';
import { useStepData } from './useStepData';

const Ids = z.union([z.string(), z.array(z.string())]).transform((value) => [value].flat());

const useFirstValueText = (
  group: ConditionGroup | undefined,
  fields: FieldInfo[],
  subject: 'customer' | 'company' | null,
) => {
  const rule = group?.rules.find(isRule);
  const field = fields.find((item) => item.path === rule?.path);
  const ids = Ids.safeParse(rule?.value).data ?? [];
  const type = field?.type;
  const members = useMemberOptions(memberQueries, type === 'member', ids);
  const tags = useTagOptions(subject ? tagsQuery(subject) : undefined, type === 'tags');
  const products = useProductOptions(productSearchQueries, type === 'product', ids);
  const records = useRecordChoices(field ? [field] : []);

  const options = [
    ...members.options,
    ...tags.options,
    ...products.options,
    ...((field && records.recordsOf(field)) ?? []),
  ];

  if (!ids.length || !options.length) return undefined;

  return ids.map((id) => options.find((option) => option.value === id)?.label ?? id).join(', ');
};

export const useTriggerText = (
  trigger: AutomationTrigger,
  triggers: { type: string; label: string }[],
  fields: FieldInfo[],
  subject: 'customer' | 'company' | null,
  timeZone: string,
) => {
  const firstValue = useFirstValueText(triggerConditions(trigger), fields, subject);

  return describeTrigger(trigger, triggers, fields, timeZone, firstValue);
};

export const useStepText = (step: AutomationStep | null | undefined) => {
  const { knownActions, knownEvents, subject, automationId } = useContext(BuilderContext);

  const { fields } = useAutomationFields(subject, automationId);
  const stepData = useStepData(step?.id ?? '', subject ?? 'customer');
  const { stages } = useLeadStages();
  const automations = useQuery(automationsQuery()).data?.data;
  const all = step ? [...fields, ...stepData] : fields;

  const firstValue = useFirstValueText(
    step?.type === 'branch' ? step.conditions : undefined,
    all,
    subject,
  );

  return step
    ? describeStep(step, {
        actions: knownActions,
        events: knownEvents,
        fields: all,
        stages,
        automations,
        firstValue,
      })
    : null;
};
