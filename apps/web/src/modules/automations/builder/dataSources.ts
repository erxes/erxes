import type { AutomationStep } from '@erxes/core-contract';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { findStep, STEP_TITLES } from './flowModel';
import { type StepData, useStepData } from './useStepData';

export type DataItem = { path: string; label: string; type: string; parent?: string };

export type DataSource = {
  id: string;
  label: string;
  /** The earlier step it comes from; null for the trigger. */
  step: AutomationStep | null;
  groups: { title: string; items: DataItem[] }[];
};

const stepIdOf = (path: string) => /^steps\.([^.]+)\./.exec(path)?.[1];

const asItem = (field: StepData, prefix = ''): DataItem => ({
  path: field.path,
  label: prefix && field.label.startsWith(prefix) ? field.label.slice(prefix.length) : field.label,
  type: field.type,
  ...(field.parent && { parent: field.parent }),
});

const isEventValue = (field: StepData) =>
  field.path.startsWith('event.payload.') && !(field.recordType && field.source);

const isRecordValue = (field: StepData) =>
  field.path.startsWith('subject.') && !field.conditionsOnly;

const useEarlierSteps = (fields: StepData[]): DataSource[] => {
  const { steps, knownActions } = useContext(BuilderContext);

  return [...new Set(fields.flatMap((field) => stepIdOf(field.path) ?? []))].map((id) => {
    const found = findStep(steps, id);

    const action =
      found?.type === 'action'
        ? knownActions.find((item) => item.type === found.action)
        : undefined;

    const label = found?.label || action?.label || (found ? STEP_TITLES[found.type] : id);

    const items = fields
      .filter((field) => stepIdOf(field.path) === id)
      .map((field) => asItem(field, `${label}: `));

    return { id, label, step: found ?? null, groups: [{ title: label, items }] };
  });
};

export const useDataSources = (
  step: AutomationStep,
  subject: 'customer' | 'company',
): DataSource[] => {
  const { t } = useTranslation('automations');
  const { trigger } = useContext(BuilderContext);
  const fields = useStepData(step.id, subject);
  const earlier = useEarlierSteps(fields);
  const triggerLabel = trigger?.label ?? t('trigger-kind', 'Trigger');

  const groups = [
    {
      title: trigger?.record
        ? t('the-record', 'The {{record}}', { record: trigger.record.toLowerCase() })
        : triggerLabel,
      items: fields.filter(isEventValue).map((field) => asItem(field)),
    },
    {
      title:
        subject === 'company' ? t('the-company', 'The company') : t('the-customer', 'The customer'),
      items: fields.filter(isRecordValue).map((field) => asItem(field)),
    },
    {
      title: t('other-data', 'Other'),
      items: [{ path: 'now | date', label: t('today-date', "Today's date"), type: 'date' }],
    },
  ].filter((group) => group.items.length);

  return [{ id: 'trigger', label: triggerLabel, step: null, groups }, ...earlier];
};
