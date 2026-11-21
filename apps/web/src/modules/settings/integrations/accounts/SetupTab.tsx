import type { IntegrationFormField, IntegrationSetup } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Spinner, useToast } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { PluginIntegrationEntry } from '../catalog';
import { DangerSection } from '../DangerSection';
import { useFormText } from './ConnectForm';
import { draftOf, type FormErrors, FormFields, readForm } from './FormFields';

const useSetupForm = (
  integration: PluginIntegrationEntry,
  fields: IntegrationFormField[],
  saved: IntegrationSetup,
) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const { toast } = useToast();
  const client = useQueryClient();
  const formText = useFormText(integration.plugin);
  const [draft, setDraft] = useState(() => draftOf(fields, saved.values));
  const [errors, setErrors] = useState<FormErrors>({});

  const refresh = () =>
    client.invalidateQueries({ queryKey: orpc.integrationAccounts.setup.key() });

  const failed = (title: string) => (error: Error) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  const save = useMutation(
    orpc.integrationAccounts.saveSetup.mutationOptions({
      onSuccess: () => {
        toast({ title: t('setup-saved', 'Saved. Secrets are not shown again.') });

        return refresh();
      },
      onError: (error) => {
        const issue = isApiError(error, 'INVALID_INPUT') ? error.data.issues[0] : undefined;
        const key = issue?.path[1];

        if (issue && typeof key === 'string') setErrors({ [key]: issue.message });
        else failed(t('setup-failed', 'Could not save'))(error);
      },
    }),
  );

  const remove = useMutation(
    orpc.integrationAccounts.removeSetup.mutationOptions({
      onSuccess: () => {
        toast({ title: t('setup-removed', 'Setup removed') });

        return refresh();
      },
      onError: failed(t('setup-remove-failed', 'Could not remove the setup')),
    }),
  );

  const submit = () => {
    const form = readForm(fields, draft, {
      sealed: saved.sealedNames,
      clearBlank: true,
      ...formText,
    });

    setErrors(form.errors);

    if (form.valid) save.mutate({ integration: integration.key, values: form.values });
  };

  return {
    draft,
    setDraft,
    errors,
    submit,
    saving: save.isPending,
    removing: remove.isPending,
    remove: () => remove.mutate({ integration: integration.key }),
  };
};

const SetupForm = ({
  integration,
  fields,
  saved,
}: {
  integration: PluginIntegrationEntry;
  fields: IntegrationFormField[];
  saved: IntegrationSetup;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();
  const form = useSetupForm(integration, fields, saved);
  const name = text(integration.plugin, integration.name);

  return (
    <div className="space-y-6">
      <form
        className="max-w-xl space-y-4"
        noValidate
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          form.submit();
        }}
      >
        <p className="text-sm text-muted-foreground">
          {t(
            'setup-intro',
            'Your organisation’s own keys for {{name}}. Every account of it uses them. Secrets are sealed and never shown again.',
            { name },
          )}
        </p>
        <FormFields
          plugin={integration.plugin}
          fields={fields}
          draft={form.draft}
          errors={form.errors}
          sealed={saved.sealedNames}
          disabled={form.saving}
          onChange={form.setDraft}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.saving}>
            {form.saving ? <Spinner size="sm" /> : t('save', 'Save')}
          </Button>
        </div>
      </form>
      {saved.updatedAt && (
        <DangerSection
          title={t('setup-remove-title', 'Remove this setup')}
          description={t(
            'setup-remove-description',
            'Its keys are deleted. Accounts connected with them may stop working.',
          )}
          confirmMessage={t('setup-remove-confirm', 'Remove the setup of {{name}}?', { name })}
          label={t('remove', 'Remove')}
          pending={form.removing}
          onConfirm={form.remove}
        />
      )}
    </div>
  );
};

export const SetupTab = ({
  integration,
  fields,
}: {
  integration: PluginIntegrationEntry;
  fields: IntegrationFormField[];
}) => {
  const setup = useQuery(
    orpc.integrationAccounts.setup.queryOptions({ input: { integration: integration.key } }),
  );

  return (
    <QueryState query={setup}>
      {(saved) => (
        <SetupForm
          key={saved.updatedAt ?? 'new'}
          integration={integration}
          fields={fields}
          saved={saved}
        />
      )}
    </QueryState>
  );
};
