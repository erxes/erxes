import type { Integration as CustomRecord } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import type { Integration } from './catalog';
import { CustomKeys } from './CustomKeys';
import { CustomPrograms } from './CustomPrograms';
import { useIntegrationsSaved } from './customMutation';
import { FormSection } from './FormSection';
import {
  HowItWorks,
  IntegrationLayout,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';
import { HostsField, hostsProblem } from './NewCustomIntegration';

const DetailsForm = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const nameId = useId();
  const [draft, setDraft] = useState(() => ({ name: record.name, hosts: record.hosts }));
  const { name, hosts } = draft;

  const update = useMutation(
    orpc.integrations.update.mutationOptions(
      useIntegrationsSaved(t('save-failed', 'Could not save'), () =>
        toast({ title: t('saved', 'Saved') }),
      ),
    ),
  );

  const changed = name.trim() !== record.name || hosts.join() !== record.hosts.join();

  return (
    <FormSection
      title={t('details', 'Details')}
      description={t('details-description', 'Its name, and the only hosts its programs may call.')}
    >
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </div>
      <HostsField hosts={hosts} onChange={(next) => setDraft({ ...draft, hosts: next })} />
      <div className="flex justify-end">
        <Button
          disabled={!changed || !name.trim() || !!hostsProblem(hosts) || update.isPending}
          onClick={() => update.mutate({ id: record.id, name: name.trim(), hosts })}
        >
          {update.isPending ? <Spinner size="sm" /> : t('save', 'Save changes')}
        </Button>
      </div>
    </FormSection>
  );
};

const RemoveIntegration = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const remove = useMutation(
    orpc.integrations.remove.mutationOptions(
      useIntegrationsSaved(
        t('remove-failed', 'Could not delete'),
        () => {
          toast({ title: t('removed', '{{name}} deleted', { name: record.name }) });
          void navigate(paths.settings.integrations);
        },
        orpc.integrations.list.key(),
      ),
    ),
  );

  const message = t(
    'remove-description',
    'Its programs, keys and versions go too. Automations that use it will fail.',
  );

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-lg border border-destructive/30 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium">{t('remove-title', 'Delete this integration')}</h3>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="destructive"
        disabled={remove.isPending}
        onClick={() =>
          void confirm({
            message: t('remove-confirm', 'Delete {{name}}?', { name: record.name }),
            options: { description: message },
          }).then(() => remove.mutate({ id: record.id }))
        }
      >
        {remove.isPending ? <Spinner size="sm" /> : t('remove', 'Delete')}
      </Button>
    </section>
  );
};

const HOW_IT_WORKS = [
  [
    'programs',
    'The assistant writes its programs: actions for automations, and incoming addresses that start them.',
  ],
  ['hosts', 'Programs reach only the allowed hosts.'],
  ['keys', 'Keys are sealed. Programs use them; nobody can read them back.'],
  ['versions', 'Every save keeps a version you can restore.'],
] as const;

const Overview = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const prefix = `integrations.${record.key}`;

  return (
    <div className="space-y-6">
      <OverviewSection title={t('type-prefix', 'In automations')}>
        <p className="text-sm text-muted-foreground">
          {t('type-prefix-hint', 'Its actions and events start with')}{' '}
          <CopyText value={prefix}>
            <code className="font-mono text-foreground">{prefix}</code>
          </CopyText>
        </p>
      </OverviewSection>
      <HowItWorks
        title={t('how', 'How it works')}
        lines={HOW_IT_WORKS.map(([key, text]) => t(`how-${key}`, text))}
      />
      <DetailsForm key={record.updatedAt} record={record} />
      <RemoveIntegration record={record} />
    </div>
  );
};

export const CustomIntegration = ({
  integration,
}: {
  integration: Extract<Integration, { kind: 'custom' }>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  const detail = useQuery(
    orpc.integrations.get.queryOptions({ input: { id: integration.record.id } }),
  );

  return (
    <QueryState query={detail}>
      {(record) => (
        <IntegrationLayout
          integration={integration}
          tab={tab}
          onTab={setTab}
          actions={
            record.sealedNames.length ? undefined : (
              <Button onClick={() => setTab('keys')}>{t('custom.add-key', 'Add a key')}</Button>
            )
          }
          tabs={[
            {
              value: 'overview',
              label: t('tab.overview', 'Overview'),
              content: <Overview record={record} />,
            },
            {
              value: 'keys',
              label: t('tab.keys', 'Keys'),
              content: <CustomKeys record={record} />,
            },
            {
              value: 'programs',
              label: t('tab.programs', 'Programs'),
              content: <CustomPrograms record={record} programs={record.programs} />,
            },
          ]}
        />
      )}
    </QueryState>
  );
};
