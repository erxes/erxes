import {
  AppSubject,
  type AutomationTrigger,
  type HookSample,
  HookSubject,
} from '@erxes/core-contract';
import { IconBuilding, IconCopy, IconUser } from '@tabler/icons-react';
import { CopyText, Select } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { ConditionsEditor } from './ConditionsEditor';
import { Field } from './Field';
import { HookSampleCall } from './HookSampleCall';
import { Segmented } from './Segmented';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

type WebhookTrigger = Extract<AutomationTrigger, { kind: 'webhook' }>;

type AppTrigger = Extract<AutomationTrigger, { kind: 'app' }>;

export type Hook = { url: string; on: boolean; sample: HookSample | null };

type HookKeys<T extends HookSubject['type']> = Record<
  Extract<HookSubject, { type: T }>['by'],
  string
>;

const CUSTOMER_KEYS: HookKeys<'customer'> = {
  primaryEmail: 'Email',
  primaryPhone: 'Phone',
  id: 'Customer ID',
};

const COMPANY_KEYS: HookKeys<'company'> = {
  primaryName: 'Name',
  id: 'Company ID',
};

const PAYLOAD = 'event.payload.';

const GUESS: Record<HookSubject['by'], RegExp> = {
  primaryEmail: /e-?mail/i,
  primaryPhone: /phone|mobile/i,
  primaryName: /company|name/i,
  id: /(^|\.)id$/i,
};

const guessField = (by: HookSubject['by'], fields: FieldInfo[], fallback: string) =>
  (fields.find((field) => GUESS[by].test(field.path)) ?? fields[0])?.path.slice(PAYLOAD.length) ??
  fallback;

export const subjectOf = (
  type: HookSubject['type'],
  fields: FieldInfo[],
  kind: 'webhook' | 'app',
): HookSubject => {
  const prefix = kind === 'webhook' ? 'body.' : '';

  return type === 'company'
    ? { type, by: 'primaryName', field: guessField('primaryName', fields, `${prefix}company`) }
    : { type, by: 'primaryEmail', field: guessField('primaryEmail', fields, `${prefix}email`) };
};

export const withSubjectBy = (
  kind: 'webhook' | 'app',
  subject: HookSubject,
  by: string,
): HookSubject | null => {
  const parsed = (kind === 'app' ? AppSubject : HookSubject).safeParse({ ...subject, by });

  return parsed.success ? parsed.data : null;
};

export const subjectFieldLabel = (field: string) =>
  field.replace(/^(body|query)\./, '').replaceAll('.', ' ');

const sampleValue = (sample: HookSample | null, field: string) =>
  field
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? Object.entries(value).find(([name]) => name === key)?.[1]
          : undefined,
      sample,
    );

const HookAddress = ({ url, on }: { url: string; on: boolean }) => {
  const { t } = useTranslation('automations');

  return (
    <Field
      label={t('hook-address', 'Address')}
      info={
        on
          ? t(
              'hook-address-hint',
              'Anyone with it can start runs: give it only to the system that calls it.',
            )
          : undefined
      }
    >
      <CopyText value={url} className="w-full min-w-0">
        <span className="flex w-full min-w-0 items-start gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-left">
          <code className="min-w-0 flex-1 break-all text-xs">{url}</code>
          <IconCopy className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </CopyText>
    </Field>
  );
};

const RequestFieldSelect = ({
  value,
  fields,
  sample,
  disabled,
  onChange,
}: {
  value: string;
  fields: FieldInfo[];
  sample: HookSample | null;
  disabled?: boolean;
  onChange: (field: string) => void;
}) => {
  const { t } = useTranslation('automations');

  const options = fields.map((field) => ({
    value: field.path.slice(PAYLOAD.length),
    label: field.label,
  }));

  if (!options.some((option) => option.value === value))
    options.unshift({ value, label: subjectFieldLabel(value) });

  return (
    <Select value={value} disabled={disabled} onValueChange={(next) => next && onChange(next)}>
      <Select.Trigger
        className="min-w-0 flex-1"
        aria-label={t('hook-find-value', 'Value from the request')}
      >
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {options.map((option) => {
          const example = sampleValue(sample, option.value);

          return (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
              {(typeof example === 'string' || typeof example === 'number') && (
                <span className="ml-2 text-xs text-muted-foreground">{example}</span>
              )}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
};

export const HookSubjectEditor = <T extends WebhookTrigger | AppTrigger>({
  trigger,
  fields: requestFields,
  sample,
  onChange,
  disabled,
}: {
  trigger: T;
  fields: FieldInfo[];
  sample: HookSample | null;
  onChange: (trigger: T) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { subject } = trigger;

  const keys = Object.entries(subject?.type === 'company' ? COMPANY_KEYS : CUSTOMER_KEYS);

  return (
    <Field
      label={t('hook-subject', 'About')}
      info={
        subject ? t('hook-subject-hint', 'When no one matches, the call starts no run.') : undefined
      }
    >
      <Segmented
        value={subject?.type ?? 'none'}
        disabled={disabled}
        label={t('hook-subject', 'About')}
        onChange={(type) =>
          onChange({
            ...trigger,
            subject: type === 'none' ? undefined : subjectOf(type, requestFields, trigger.kind),
          })
        }
        options={[
          { value: 'none', label: t('hook-subject-nobody', 'Nobody') },
          { value: 'customer', label: t('test-customer', 'Customer'), icon: IconUser },
          { value: 'company', label: t('test-company', 'Company'), icon: IconBuilding },
        ]}
      />
      {subject && (
        <div className="flex items-center gap-2 text-sm">
          <span className="shrink-0 text-muted-foreground">{t('hook-whose', 'whose')}</span>
          <Select
            value={subject.by}
            disabled={disabled}
            onValueChange={(by) => {
              const next = by ? withSubjectBy(trigger.kind, subject, by) : null;

              if (next) onChange({ ...trigger, subject: next });
            }}
          >
            <Select.Trigger className="w-32 shrink-0" aria-label={t('hook-find-by', 'Find by')}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {keys.map(([key, label]) => (
                <Select.Item key={key} value={key}>
                  {t(`hook-key.${subject.type}-${key}`, label)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <span className="shrink-0 text-muted-foreground">{t('hook-is', 'is')}</span>
          <RequestFieldSelect
            value={subject.field}
            fields={requestFields}
            sample={sample}
            disabled={disabled}
            onChange={(field) => onChange({ ...trigger, subject: { ...subject, field } })}
          />
        </div>
      )}
    </Field>
  );
};

export const WebhookTriggerSettings = ({
  trigger,
  hook,
  onChange,
  disabled,
}: {
  trigger: WebhookTrigger;
  hook: Hook;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { automationId } = useContext(BuilderContext);

  const requestFields = useAutomationFields(null, automationId).fields.filter((field) =>
    /^event\.payload\.(body|query)\./.test(field.path),
  );

  return (
    <>
      <HookAddress url={hook.url} on={hook.on} />
      <HookSampleCall sample={hook.sample} on={hook.on} />
      <HookSubjectEditor
        trigger={trigger}
        fields={requestFields}
        sample={hook.sample}
        disabled={disabled}
        onChange={onChange}
      />
      <Field label={t('only-if', 'Only if')}>
        <ConditionsEditor
          subject={trigger.subject?.type ?? null}
          value={trigger.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...trigger, conditions })}
        />
      </Field>
    </>
  );
};
