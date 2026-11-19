import { IntegrationHosts, IntegrationKey } from '@erxes/core-contract/integrationValues';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Spinner, StringArrayInput, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { customIntegrationKey } from './catalog';

const isKey = (value: string) => IntegrationKey.safeParse(value).success;

const keyFromName = (name: string) =>
  name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/, '')
    .slice(0, 40);

type HostsProblem = { code: 'none' } | { code: 'many'; max: number } | { code: 'invalid' };

export const hostsProblem = (hosts: string[]): HostsProblem | null => {
  const parsed = IntegrationHosts.safeParse(hosts);

  if (parsed.success) return null;

  const issue = parsed.error.issues.find((each) => each.path.length === 0);

  if (issue?.code === 'too_small') return { code: 'none' };

  if (issue?.code === 'too_big') return { code: 'many', max: Number(issue.maximum) };

  return { code: 'invalid' };
};

export const HostsField = ({
  hosts,
  onChange,
}: {
  hosts: string[];
  onChange: (hosts: string[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const id = useId();
  const problem = hostsProblem(hosts);

  const message =
    problem?.code === 'many'
      ? t('hosts-many', 'At most {{count}} hosts.', { count: problem.max })
      : problem?.code === 'invalid'
        ? t('hosts-invalid', 'Each host is a name like api.example.com, without https://.')
        : null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('hosts', 'Allowed hosts')}</Label>
      <StringArrayInput
        id={id}
        value={hosts}
        onValueChange={onChange}
        placeholder={t('hosts-placeholder', 'api.example.com')}
      />
      {message ? (
        <p className="text-xs text-destructive-text">{message}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('hosts-hint', 'Programs may call only these hosts. Press Enter after each one.')}
        </p>
      )}
    </div>
  );
};

const KeyField = ({
  value,
  taken,
  onChange,
}: {
  value: string;
  taken: boolean;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const id = useId();
  const invalid = !!value && !isKey(value);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('key', 'Key')}</Label>
      <Input
        id={id}
        value={value}
        placeholder="acme_crm"
        onChange={(event) => onChange(event.target.value)}
      />
      {taken || invalid ? (
        <p className="text-xs text-destructive-text">
          {taken
            ? t('key-taken', 'Another integration has this key.')
            : t('key-invalid', 'Lower case letters, digits and _, starting with a letter.')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('key-hint', 'Automations use integrations.{{key}}. It cannot change later.', {
            key: value || 'key',
          })}
        </p>
      )}
    </div>
  );
};

const NewForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();
  const nameId = useId();
  const [name, setName] = useState('');
  const [key, setKey] = useState<string | null>(null);
  const [hosts, setHosts] = useState<string[]>([]);
  const shownKey = key ?? keyFromName(name);

  const create = useMutation(
    orpc.integrations.create.mutationOptions({
      onSuccess: async (created) => {
        await client.invalidateQueries({ queryKey: orpc.integrations.key() });
        toast({ title: t('created', 'Integration added') });
        onDone();
        void navigate({
          pathname: paths.settings.integration(customIntegrationKey(created.key)),
          search: new URLSearchParams({ tab: 'keys' }).toString(),
        });
      },
      onError: (error) => {
        if (isApiError(error, 'TAKEN')) return;

        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not add the integration'),
          description: messageOf(error),
        });
      },
    }),
  );

  const taken = isApiError(create.error, 'TAKEN');
  const ready = name.trim() && isKey(shownKey) && !hostsProblem(hosts);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (ready) create.mutate({ name: name.trim(), key: shownKey, hosts });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
        <Input
          id={nameId}
          value={name}
          placeholder={t('name-placeholder', 'Acme CRM')}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <KeyField
        value={shownKey}
        taken={taken}
        onChange={(next) => {
          create.reset();
          setKey(next);
        }}
      />
      <HostsField hosts={hosts} onChange={setHosts} />
      <Button type="submit" className="w-full" disabled={!ready || create.isPending}>
        {create.isPending ? <Spinner size="sm" /> : t('add', 'Add integration')}
      </Button>
    </form>
  );
};

export const NewCustomIntegration = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'Add integration')}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add-title', 'Add a custom integration')}
          description={t(
            'add-description',
            'Connect a service erxes has no integration for. The assistant writes its programs.',
          )}
        />
        {open && <NewForm onDone={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
