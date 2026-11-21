import type { IntegrationAccount } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconDots, IconPencil, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Dialog,
  DropdownMenu,
  Input,
  Label,
  Spinner,
  useConfirm,
  useFormat,
  useToast,
} from 'erxes-ui';
import { type ReactNode, type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountsChanged, useFailureToast } from './accountState';

const RenameForm = ({ account, onDone }: { account: IntegrationAccount; onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const id = useId();
  const changed = useAccountsChanged();
  const onError = useFailureToast(t('rename-failed', 'Could not rename'));
  const [name, setName] = useState(() => account.name);

  const rename = useMutation(
    orpc.integrationAccounts.rename.mutationOptions({
      onSuccess: () => {
        onDone();

        return changed();
      },
      onError,
    }),
  );

  const trimmed = name.trim();

  return (
    <form
      className="space-y-4"
      onSubmit={(event: SubmitEvent) => {
        event.preventDefault();

        if (trimmed) rename.mutate({ id: account.id, name: trimmed });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={id}>{t('name', 'Name')}</Label>
        <Input id={id} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <Dialog.Footer>
        <Button type="submit" disabled={!trimmed || trimmed === account.name || rename.isPending}>
          {rename.isPending ? <Spinner size="sm" /> : t('save', 'Save')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

const useRemoveAccount = (account: IntegrationAccount) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const client = useQueryClient();
  const changed = useAccountsChanged();
  const onError = useFailureToast(t('remove-failed', 'Could not remove'));

  const remove = useMutation(
    orpc.integrationAccounts.remove.mutationOptions({
      onSuccess: () => {
        toast({ title: t('removed', '{{name}} removed', { name: account.name }) });

        return changed();
      },
      onError,
    }),
  );

  const usage = useMutation({
    mutationFn: () =>
      client.query(
        orpc.integrationAccounts.usage.queryOptions({ input: { id: account.id }, staleTime: 0 }),
      ),
    onSuccess: ({ automations }) =>
      void confirm({
        message: t('remove-confirm', 'Remove {{name}}?', { name: account.name }),
        options: {
          description: automations.length
            ? t(
                'remove-used',
                'Its secret is deleted. These automations use it and will fail: {{names}}.',
                { names: automations.map((item) => item.name).join(', ') },
              )
            : t('remove-unused', 'Its secret is deleted. No automation uses it.'),
        },
      }).then(() => remove.mutate({ id: account.id })),
    onError,
  });

  return { ask: () => usage.mutate(), pending: usage.isPending || remove.isPending };
};

const useCheckAccount = (account: IntegrationAccount) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const { toast } = useToast();
  const changed = useAccountsChanged();
  const onError = useFailureToast(t('check-failed', 'Could not check'));

  return useMutation(
    orpc.integrationAccounts.check.mutationOptions({
      onSuccess: (checked) => {
        toast(
          checked.status === 'healthy'
            ? { title: t('check-healthy', '{{name}} works', { name: account.name }) }
            : {
                variant: 'destructive',
                title: t('check-broken', '{{name}} needs reconnecting', { name: account.name }),
                description: checked.error ?? undefined,
              },
        );

        return changed();
      },
      onError,
    }),
  );
};

const AccountMenu = ({
  account,
  checks,
  onRename,
}: {
  account: IntegrationAccount;
  checks: boolean;
  onRename: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const remove = useRemoveAccount(account);
  const check = useCheckAccount(account);
  const busy = remove.pending || check.isPending;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label={t('actions', 'Actions for {{name}}', { name: account.name })}
          />
        }
      >
        {busy ? <Spinner size="sm" /> : <IconDots />}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onClick={onRename}>
          <IconPencil />
          {t('rename', 'Rename')}
        </DropdownMenu.Item>
        {checks && (
          <DropdownMenu.Item onClick={() => check.mutate({ id: account.id })}>
            <IconRefresh />
            {t('check', 'Check now')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item variant="destructive" onClick={remove.ask}>
          <IconTrash />
          {t('remove', 'Remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const AccountRow = ({
  account,
  kindLabel,
  checks,
  reconnect,
  showStatus = true,
  actions,
  children,
}: {
  account: IntegrationAccount;
  kindLabel?: string;
  checks: boolean;
  reconnect?: ReactNode;
  showStatus?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const format = useFormat();
  const [renaming, setRenaming] = useState(false);
  const broken = account.status === 'broken';

  return (
    <li className="flex flex-wrap items-center gap-3 p-3 text-sm">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{account.name}</span>
          {account.detail && (
            <span className="truncate text-muted-foreground">{account.detail}</span>
          )}
          {kindLabel && <Badge variant="secondary">{kindLabel}</Badge>}
          {showStatus && (
            <Badge variant={broken ? 'warning' : 'success'}>
              {broken ? t('needs-reconnect', 'Needs reconnecting') : t('healthy', 'Healthy')}
            </Badge>
          )}
        </div>
        {broken && account.error && (
          <p className="text-xs text-destructive-text">{account.error}</p>
        )}
        {account.checkedAt && (
          <p className="text-xs text-muted-foreground">
            {t('checked', 'Checked {{when}}', { when: format.relative(account.checkedAt) })}
          </p>
        )}
      </div>
      {broken && reconnect}
      {actions}
      <AccountMenu account={account} checks={checks} onRename={() => setRenaming(true)} />
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>
              {t('rename-title', 'Rename {{name}}', { name: account.name })}
            </Dialog.Title>
            <Dialog.Description>
              {t('rename-description', 'The name people pick it by in erxes.')}
            </Dialog.Description>
          </Dialog.Header>
          {renaming && <RenameForm account={account} onDone={() => setRenaming(false)} />}
        </Dialog.Content>
      </Dialog>
      {children && <div className="w-full">{children}</div>}
    </li>
  );
};
