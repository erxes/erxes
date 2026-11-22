import { type AutomationTrigger, HookSubject } from '@erxes/core-contract';
import { IconBuilding, IconCopy, IconUser } from '@tabler/icons-react';
import { CopyText, Select } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { ConditionsEditor } from './ConditionsEditor';
import { Segmented } from './Segmented';
import { TemplateInput } from './TemplateInput';
import { Field } from './triggerFields';
import { useAutomationFields } from './useAutomationFields';

type WebhookTrigger = Extract<AutomationTrigger, { kind: 'webhook' }>;

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

const DEFAULT_SUBJECT: Record<HookSubject['type'], HookSubject> = {
  customer: { type: 'customer', by: 'primaryEmail', value: '{{event.payload.body.email}}' },
  company: { type: 'company', by: 'primaryName', value: '{{event.payload.body.company}}' },
};

const HookAddress = ({ url, on }: { url: string | null; on: boolean }) => {
  const { t } = useTranslation('automations');

  if (!url)
    return (
      <Field label={t('hook-address', 'Address')}>
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          {t('hook-address-after-save', 'Save to get the address.')}
        </p>
      </Field>
    );

  return (
    <Field
      label={t('hook-address', 'Address')}
      hint={
        on
          ? t(
              'hook-address-hint',
              'Anyone with it can start runs: give it only to the system that calls it.',
            )
          : t('hook-address-off', 'Calls start runs only while the automation is on.')
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

const HookSubjectEditor = ({
  trigger,
  onChange,
  disabled,
}: {
  trigger: WebhookTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { automationId } = useContext(BuilderContext);
  const { subject } = trigger;

  const requestFields = useAutomationFields(null, automationId).fields.filter((field) =>
    field.path.startsWith('event.payload.'),
  );

  const keys = Object.entries(subject?.type === 'company' ? COMPANY_KEYS : CUSTOMER_KEYS);

  return (
    <Field
      label={t('hook-subject', 'Who the run is about')}
      hint={
        subject
          ? t('hook-subject-hint', 'When no one matches, the call starts no run.')
          : t('hook-subject-none', 'Runs aren’t about a customer or company.')
      }
    >
      <Segmented
        value={subject?.type ?? 'none'}
        disabled={disabled}
        label={t('hook-subject', 'Who the run is about')}
        onChange={(type) =>
          onChange({ ...trigger, subject: type === 'none' ? undefined : DEFAULT_SUBJECT[type] })
        }
        options={[
          { value: 'none', label: t('hook-subject-nobody', 'Nobody') },
          { value: 'customer', label: t('test-customer', 'Customer'), icon: IconUser },
          { value: 'company', label: t('test-company', 'Company'), icon: IconBuilding },
        ]}
      />
      {subject && (
        <div className="flex items-start gap-2">
          <Select
            value={subject.by}
            disabled={disabled}
            onValueChange={(by) => {
              const next = HookSubject.safeParse({ ...subject, by });

              if (next.success) onChange({ ...trigger, subject: next.data });
            }}
          >
            <Select.Trigger className="w-36 shrink-0" aria-label={t('hook-find-by', 'Find by')}>
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
          <div className="min-w-0 flex-1">
            <TemplateInput
              label={t('hook-find-value', 'Value from the request')}
              value={subject.value}
              fields={requestFields}
              subject={subject.type}
              disabled={disabled}
              invalid={!subject.value.trim()}
              onChange={(value) => onChange({ ...trigger, subject: { ...subject, value } })}
            />
          </div>
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
  hook: { url: string | null; on: boolean };
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <>
      <HookAddress url={hook.url} on={hook.on} />
      <HookSubjectEditor trigger={trigger} disabled={disabled} onChange={onChange} />
      <Field
        label={t('only-if', 'Only if')}
        hint={
          trigger.conditions?.rules.length
            ? undefined
            : t('hook-only-if-empty', 'No conditions: every call starts a run.')
        }
      >
        <ConditionsEditor
          subject={trigger.subject?.type ?? null}
          value={trigger.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...trigger, conditions })}
        />
      </Field>
      <div className="space-y-1.5 rounded-lg border p-3 text-xs text-muted-foreground">
        <p>
          {t(
            'hook-answer',
            'The caller hears “accepted” at once. To send data back, add a “Reply to the webhook” step: the caller then waits up to 30 seconds for it.',
          )}
        </p>
        <p>
          {t(
            'hook-fields-hint',
            'The request’s fields show up in conditions and Insert data after its first call while it is on.',
          )}
        </p>
      </div>
    </>
  );
};
