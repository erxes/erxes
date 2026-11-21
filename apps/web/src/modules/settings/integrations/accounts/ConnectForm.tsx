import type { IntegrationConnectResult, IntegrationFormField } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, Spinner, useToast } from 'erxes-ui';
import { type ReactNode, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';
import { integrationPath, type PluginIntegrationEntry } from '../catalog';
import { IntegrationShell } from '../IntegrationLayout';
import { useAccountsChanged, useCloseStep, useIntegrationView } from './accountState';
import { draftOf, type FormErrors, FormFields, readForm } from './FormFields';

export const StepHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) => (
  <header className="flex flex-wrap items-start gap-4">
    <div className="min-w-0 flex-1 space-y-1">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
);

export const FailedAccounts = ({ failed }: { failed: IntegrationConnectResult['failed'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });

  if (!failed.length) return null;

  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 p-4 text-sm">
      <p className="font-medium">
        {t('some-failed', '{{count}} could not be connected', { count: failed.length })}
      </p>
      <ul className="space-y-1 text-muted-foreground">
        {failed.map((item) => (
          <li key={item.name}>
            <span className="text-foreground">{item.name}</span>: {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const useFormText = (plugin: string) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();

  return {
    required: (field: IntegrationFormField) =>
      t('field-required', 'Enter {{field}}', { field: text(plugin, field.label) }),
    notNumber: (field: IntegrationFormField) =>
      t('field-number', '{{field}} must be a number', { field: text(plugin, field.label) }),
  };
};

const useConnectForm = (integration: PluginIntegrationEntry, fields: IntegrationFormField[]) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const { toast } = useToast();
  const [, setView] = useIntegrationView();
  const close = useCloseStep();
  const changed = useAccountsChanged();
  const formText = useFormText(integration.plugin);
  const [draft, setDraft] = useState(() => draftOf(fields, {}));
  const [errors, setErrors] = useState<FormErrors>({});
  const [refusal, setRefusal] = useState<string | null>(null);
  const [failed, setFailed] = useState<IntegrationConnectResult['failed']>([]);

  const connect = useMutation(
    orpc.integrationAccounts.connect.mutationOptions({
      onSuccess: (result) => {
        void changed();

        if (result.pickId) return void setView({ connect: null, pick: result.pickId });

        setFailed(result.failed);

        if (result.connected.length) {
          toast({
            title: t('connected-count', '{{count}} connected', { count: result.connected.length }),
          });
        }

        if (!result.failed.length) close();
      },
      onError: (error) => {
        const issue = isApiError(error, 'INVALID_INPUT') ? error.data.issues[0] : undefined;
        const key = issue?.path[1];

        if (issue && typeof key === 'string') setErrors({ [key]: issue.message });
        else setRefusal(messageOf(error));
      },
    }),
  );

  const submit = () => {
    const form = readForm(fields, draft, { sealed: [], clearBlank: false, ...formText });

    setErrors(form.errors);
    setRefusal(null);
    setFailed([]);

    if (form.valid) connect.mutate({ integration: integration.key, values: form.values });
  };

  return { draft, setDraft, errors, refusal, failed, submit, close, pending: connect.isPending };
};

export const ConnectForm = ({
  integration,
  fields,
}: {
  integration: PluginIntegrationEntry;
  fields: IntegrationFormField[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();
  const form = useConnectForm(integration, fields);
  const name = text(integration.plugin, integration.name);

  return (
    <IntegrationShell
      integration={integration}
      step={{ label: t('connect', 'Connect'), to: `${integrationPath(integration)}?connect=true` }}
    >
      <form
        className="mx-auto max-w-xl space-y-6"
        noValidate
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          form.submit();
        }}
      >
        <StepHeader
          title={t('connect-title', 'Connect {{name}}', { name })}
          description={t(
            'connect-description',
            'What you enter is checked with {{name}}. Secrets are sealed and never shown again.',
            { name },
          )}
        />
        {form.refusal && (
          <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm">
            {form.refusal}
          </p>
        )}
        <FailedAccounts failed={form.failed} />
        <div className="space-y-4">
          <FormFields
            plugin={integration.plugin}
            fields={fields}
            draft={form.draft}
            errors={form.errors}
            disabled={form.pending}
            onChange={form.setDraft}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={form.pending} onClick={form.close}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending ? <Spinner size="sm" /> : t('connect', 'Connect')}
          </Button>
        </div>
      </form>
    </IntegrationShell>
  );
};
