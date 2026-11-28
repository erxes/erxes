import { IconPlugConnected, IconSearch } from '@tabler/icons-react';
import { messageOf } from '@erxes/core-contract/client';
import {
  Button,
  InputGroup,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Tabs,
  AppBreadcrumb,
} from 'erxes-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { BrowseIntegrations, useSections } from './BrowseIntegrations';
import { CATEGORIES, useMayOpenIntegrations } from './catalog';
import { ConnectedIntegrations, useConnected } from './ConnectedIntegrations';

const TABS = ['connected', 'browse'] as const;

type Tab = (typeof TABS)[number];

const Count = ({ count }: { count: number }) => (
  <span className="ml-1 text-xs text-muted-foreground">{count}</span>
);

const Heading = ({ search, onSearch }: { search: string; onSearch: (q: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-lg font-semibold">{t('title', 'Integrations')}</h1>
        <p className="text-sm text-muted-foreground">
          {t(
            'intro',
            'Connect the services your organisation works with. Each one runs for all your plugins.',
          )}
        </p>
      </div>
      <InputGroup className="h-8 w-full sm:w-64">
        <InputGroup.Addon>
          <IconSearch className="pointer-events-none size-3.5" />
        </InputGroup.Addon>
        <InputGroup.Input
          type="search"
          placeholder={t('search', 'Search integrations…')}
          aria-label={t('search', 'Search integrations…')}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </InputGroup>
    </div>
  );
};

const LoadFailed = ({ listed }: { listed: ReturnType<typeof useSections>['listed'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!listed.isError) return null;

  return (
    <div role="alert" className="flex items-center gap-3 rounded-lg border p-3 text-sm">
      <span className="flex-1 text-destructive-text">
        {t('load-failed', 'Could not load the integrations: {{message}}', {
          message: messageOf(listed.error),
        })}
      </span>
      <Button variant="outline" size="sm" onClick={() => void listed.refetch()}>
        {t('retry', 'Retry')}
      </Button>
    </div>
  );
};

const Integrations = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  const [params, setParams] = useQueryStates({
    q: parseAsString,
    category: parseAsStringLiteral(CATEGORIES),
    tab: parseAsStringLiteral(TABS),
  });

  const search = params.q ?? '';
  const sections = useSections(search, params.category);
  const connected = useConnected(search);
  const opened: Tab = connected.count ? 'connected' : 'browse';
  const tab = params.tab ?? (connected.pending ? null : opened);
  const open = (next: Tab) => void setParams({ tab: next });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Heading search={search} onSearch={(q) => void setParams({ q: q || null })} />
      <LoadFailed listed={sections.listed} />
      {tab === null ? (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs value={tab} onValueChange={open}>
            <Tabs.List variant="flush" className="h-9">
              <Tabs.Trigger value="connected">
                {t('view.connected', 'Connected')}
                {!connected.pending && <Count count={connected.count} />}
              </Tabs.Trigger>
              <Tabs.Trigger value="browse">
                {t('view.browse', 'Browse')}
                {!sections.listed.isPending && <Count count={sections.total} />}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          {tab === 'connected' ? (
            <ConnectedIntegrations connected={connected} onBrowse={() => open('browse')} />
          ) : (
            <BrowseIntegrations
              sections={sections}
              onCategory={(category) => void setParams({ category })}
            />
          )}
        </div>
      )}
    </div>
  );
};

/** Settings › Integrations: what the organisation has connected, and the catalog of services. */
export const IntegrationsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!useMayOpenIntegrations()) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Integrations'),
                to: paths.settings.integrations,
                icon: IconPlugConnected,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <Integrations />
      </ScrollArea>
    </PageContainer>
  );
};
