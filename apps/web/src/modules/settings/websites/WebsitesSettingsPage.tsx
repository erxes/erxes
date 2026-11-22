import type { WebsiteListItem } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconWorldWww } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Badge, Empty, PageContainer, PageHeader, ScrollArea, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { pluginTitle, useInstalledPlugins } from '~/modules/products/useCatalogContext';

const NoWebsites = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'websites' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconWorldWww />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No websites yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'A plugin adds one for each store or site customers sign in to, such as an ecommerce store.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** One website: whose it is, where it runs, and how many customers have an account on it. */
const WebsiteRow = ({ website, plugin }: { website: WebsiteListItem; plugin: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'websites' });
  const fmt = useFormat();

  return (
    <li className="space-y-2 rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-medium">{website.name}</span>
        <span className="text-sm text-muted-foreground">{plugin}</span>
        <span className="ml-auto text-sm text-muted-foreground">
          {t('accounts', '{{count}} accounts', { count: website.accounts })}
        </span>
      </div>
      {website.origins.length ? (
        <div className="flex flex-wrap gap-1">
          {website.origins.map((origin) => (
            <Badge key={origin} variant="secondary">
              {origin}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t(
            'no-addresses',
            'No web addresses: only its server or mobile app can sign customers in.',
          )}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t('updated', 'Changed {{when}}', { when: fmt.dateTime(website.updatedAt) })}
      </p>
    </li>
  );
};

/** Settings › Websites: where customers sign in, each with its own accounts (decision 42). */
export const WebsitesSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'websites' });
  const can = useCan();
  const { plugins } = useInstalledPlugins();

  const websites = useQuery(
    orpc.websites.list.queryOptions({ input: can('contacts.view') ? undefined : skipToken }),
  );

  if (!can('contacts.view')) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Websites'), to: paths.settings.websites, icon: IconWorldWww },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Customers sign up on each website on its own, with a code sent to their email. Each plugin keeps its websites and their web addresses in its own settings, such as a store’s.',
            )}
          </p>
          <QueryState
            query={websites}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoWebsites />}
          >
            {({ data }) => (
              <ul className="space-y-2">
                {data.map((website) => (
                  <WebsiteRow
                    key={website.id}
                    website={website}
                    plugin={pluginTitle(plugins, website.plugin)}
                  />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
