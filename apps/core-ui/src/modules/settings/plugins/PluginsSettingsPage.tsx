import type { Plugin } from '@erxes/core-contract';
import { IconApps, IconPlugConnected, IconShieldCheck } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Empty, PageContainer, PageHeader, ScrollArea, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { countryNames } from '~/lib/region';
import { useCan, useSession } from '~/modules/auth/session';

/** What each scope lets a plugin do in core, in words. */
const SCOPE_LABELS: Record<string, string> = {
  'activities:write': 'Add entries to customer and company timelines',
  'audit:write': 'Record its changes in the audit log',
  'events:write': 'Publish events (timelines, notifications, automations)',
  'files:read': 'Read files',
  'files:write': 'Upload and delete files',
  'live:write': 'Refresh its screens live',
  'notifications:write': 'Send notifications to team members',
};

/** Installs (or approves) and uninstalls a plugin, updating the list in place. */
const usePluginChange = (plugin: Plugin) => {
  const { t } = useTranslation('settings', { keyPrefix: 'plugins' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (install: boolean) =>
      install
        ? orpc.plugins.install.call({ name: plugin.name })
        : orpc.plugins.uninstall.call({ name: plugin.name }),
    onSuccess: (next) => {
      client.setQueryData(orpc.plugins.list.queryKey(), (current) =>
        current
          ? { data: current.data.map((item) => (item.name === next.name ? next : item)) }
          : current,
      );

      // The app switcher loads plugin UIs from the installed list.
      return client.invalidateQueries({ queryKey: orpc.plugins.list.key() });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Could not change the plugin'),
        description: messageOf(error),
      }),
  });
};

/** What the plugin can do, or will be able to; scopes a new version asks for are marked. */
const PluginScopes = ({ plugin }: { plugin: Plugin }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'plugins' });

  const isNew = (scope: string) => plugin.installed && !plugin.grantedScopes.includes(scope);

  if (!plugin.requestedScopes.length) return null;

  return (
    <div className="pl-13 text-sm">
      <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">
        {plugin.installed ? t('can', 'Can') : t('will-be-able', 'Will be able to')}
      </p>
      <ul className="space-y-0.5">
        {plugin.requestedScopes.map((scope) => (
          <li key={scope} className="flex items-center gap-2">
            <span className={isNew(scope) ? 'text-amber-600' : ''}>
              {t(`scope.${scope.replace(':', '-')}`, SCOPE_LABELS[scope] ?? scope)}
            </span>
            {isNew(scope) && (
              <span className="text-xs text-amber-600">
                {t('new-scope', '(new — needs approval)')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/** "Made for Mongolia" when the plugin names countries and this organisation's isn't one. */
const MadeFor = ({ countries }: { countries: string[] }) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'plugins' });
  const { country } = useSession().organization;

  if (!countries.length || (country && countries.includes(country))) return null;

  return (
    <span className="text-xs text-muted-foreground">
      {t('made-for', 'Made for {{countries}}', {
        countries: countryNames(countries, i18n.language),
      })}
    </span>
  );
};

const PluginCard = ({ plugin, isOwner }: { plugin: Plugin; isOwner: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'plugins' });
  const change = usePluginChange(plugin);

  return (
    <li className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <IconApps className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{plugin.title}</h3>
            {plugin.version && (
              <span className="text-xs text-muted-foreground">v{plugin.version}</span>
            )}
            {plugin.installed ? (
              <Badge variant="success">{t('installed', 'Installed')}</Badge>
            ) : (
              <Badge variant="secondary">{t('not-installed', 'Not installed')}</Badge>
            )}
            {plugin.needsApproval && (
              <Badge variant="warning">{t('needs-approval', 'Asks for more access')}</Badge>
            )}
            <MadeFor countries={plugin.countries} />
          </div>
          {plugin.description && (
            <p className="text-sm text-muted-foreground">{plugin.description}</p>
          )}
          {plugin.statusReason && <p className="text-sm text-destructive">{plugin.statusReason}</p>}
        </div>
        {isOwner && (
          <div className="flex shrink-0 gap-2">
            {plugin.needsApproval && (
              <Button size="sm" disabled={change.isPending} onClick={() => change.mutate(true)}>
                <IconShieldCheck />
                {t('approve', 'Approve access')}
              </Button>
            )}
            <Button
              size="sm"
              variant={plugin.installed ? 'outline' : 'default'}
              disabled={change.isPending}
              onClick={() => change.mutate(!plugin.installed)}
            >
              {plugin.installed ? t('uninstall', 'Uninstall') : t('install', 'Install')}
            </Button>
          </div>
        )}
      </div>
      <PluginScopes plugin={plugin} />
    </li>
  );
};

/**
 * Settings › Plugins: the plugins this deployment has, and which are
 * installed here. Owners install and uninstall (a plugin's tokens stop
 * working at once) and approve the access a newer version asks for.
 */
export const PluginsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plugins' });
  const can = useCan();
  const plugins = useQuery(orpc.plugins.list.queryOptions());

  const empty = (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconApps />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No plugins yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Plugins appear here once your administrator connects them to this erxes.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Plugins'), to: '/settings/plugins', icon: IconPlugConnected },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl p-6">
          <QueryState
            query={plugins}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={empty}
          >
            {({ data }) => (
              <ul className="space-y-3">
                {data.map((plugin) => (
                  <PluginCard key={plugin.name} plugin={plugin} isOwner={can('plugins.manage')} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
