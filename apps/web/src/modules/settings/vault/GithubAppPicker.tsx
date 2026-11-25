import type { GithubAppFacts } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconBrandGithub, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, buttonVariants, cn, CONNECTION_CONTENT_TYPE, useToast } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { UserAvatar } from '~/components/UserAvatar';
import { useCan } from '~/modules/auth/session';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { useConnectionsChanged } from '../integrations/ConnectionFields';
import { AppSetNote } from './AppSetNote';
import { GithubAppForm } from './GithubAppForm';

/** The organisation connects GitHub only through a GitHub App, never with a token. */
export const connectsThroughApp = (key: string) => key === 'github';

const Ticket = z.object({
  installations: z.array(
    z.object({ id: z.int(), account: z.string(), avatarUrl: z.string().nullable() }),
  ),
  installUrl: z.string(),
});

type Ticket = z.output<typeof Ticket>;

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

/** No App yet: the next step waits, and a member who may sets the App up right here. */
const NeedsApp = ({ facts }: { facts: GithubAppFacts }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const canSetApp = useCan()('integrations.manage');

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled>
        <IconBrandGithub />
        {t('needs-app', 'Set up your GitHub App first')}
      </Button>
      {canSetApp && <GithubAppForm facts={facts} />}
    </div>
  );
};

/** The App is set: say which, then send the member to GitHub to pick an account. */
const SignInStep = ({ facts }: { facts: GithubAppFacts }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const { toast } = useToast();

  const signIn = useMutation(
    orpc.githubApp.signIn.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  return (
    <div className="space-y-3">
      {facts.source === 'organization' && (
        <AppSetNote
          name={facts.slug ?? 'GitHub App'}
          detail={t('app-id-short', 'ID {{id}}', { id: facts.appId })}
        />
      )}
      <Button className="w-full" disabled={signIn.isPending} onClick={() => signIn.mutate({})}>
        <IconBrandGithub />
        {t('sign-in', 'Choose a GitHub account')}
      </Button>
    </div>
  );
};

/** Back from GitHub: the accounts the App is installed on, one click each to connect. */
const InstallationList = ({ token, ticket }: { token: string; ticket: Ticket }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const { toast } = useToast();
  const [, setToken] = useQueryState('github');
  const changed = useConnectionsChanged();
  const showCreated = useCreatedPanelRecord(CONNECTION_CONTENT_TYPE);

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

/** The organisation's GitHub: set up its App, sign in to GitHub, then pick an installation. */
export const GithubAppPicker = () => {
  const [token] = useQueryState('github');
  const ticket = ticketOf(token);
  const app = useQuery(orpc.githubApp.app.queryOptions());

  if (!app.data) return null;

  if (!app.data.source) return <NeedsApp facts={app.data} />;

  if (!token || !ticket) return <SignInStep facts={app.data} />;

  return <InstallationList token={token} ticket={ticket} />;
};
