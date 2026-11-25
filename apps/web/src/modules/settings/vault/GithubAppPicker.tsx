import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconBrandGithub, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, buttonVariants, cn, CONNECTION_CONTENT_TYPE, useToast } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { UserAvatar } from '~/components/UserAvatar';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { useConnectionsChanged } from '../integrations/ConnectionFields';

/** The organisation connects GitHub only through the server's GitHub App, never with a token. */
export const connectsThroughApp = (key: string) => key === 'github';

const Ticket = z.object({
  installations: z.array(
    z.object({ id: z.int(), account: z.string(), avatarUrl: z.string().nullable() }),
  ),
  installUrl: z.string(),
});

/** The ticket core signs after the GitHub sign-in: readable JSON, then core's signature. */
const ticketOf = (token: string | null) => {
  const [body] = (token ?? '').split('.');

  try {
    const json: unknown = JSON.parse(atob((body ?? '').replace(/-/g, '+').replace(/_/g, '/')));

    return Ticket.safeParse(json).data ?? null;
  } catch {
    return null;
  }
};

/** The App's installations the member manages on GitHub, to pick the organisation's from. */
export const GithubAppPicker = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const { toast } = useToast();
  const [token, setToken] = useQueryState('github');
  const ticket = ticketOf(token);
  const changed = useConnectionsChanged();
  const showCreated = useCreatedPanelRecord(CONNECTION_CONTENT_TYPE);

  const signIn = useMutation(
    orpc.githubApp.signIn.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  const connect = useMutation(
    orpc.githubApp.connect.mutationOptions({
      onSuccess: (connection) => {
        void changed();
        void setToken(null);
        toast({ title: t('connected', '{{name}} is connected', { name: connection.name }) });
        showCreated(connection.id);
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  if (!token || !ticket)
    return (
      <Button className="w-full" disabled={signIn.isPending} onClick={() => signIn.mutate({})}>
        <IconBrandGithub />
        {t('sign-in', 'Choose a GitHub account')}
      </Button>
    );

  return (
    <div className="space-y-2">
      <ul className="divide-y rounded-lg border">
        {ticket.installations.map((installation) => (
          <li key={installation.id}>
            <button
              type="button"
              disabled={connect.isPending}
              className="flex w-full items-center gap-3 p-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
              onClick={() => connect.mutate({ ticket: token, installationId: installation.id })}
            >
              <UserAvatar name={installation.account} src={installation.avatarUrl} />
              <span className="min-w-0 flex-1 truncate font-medium">{installation.account}</span>
              <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
        {ticket.installations.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">
            {t('none', 'Not installed on any of your accounts yet')}
          </li>
        )}
      </ul>
      <a href={ticket.installUrl} className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        <IconPlus />
        {t('install', 'Install on another account')}
      </a>
    </div>
  );
};
