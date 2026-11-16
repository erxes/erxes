import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconSourceCode } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { type ApiAudience, ApiReferenceView, type ReferenceSource } from './ApiReferenceView';

const isAudience = (value: string): value is ApiAudience =>
  value === 'member' || value === 'customer';

/** The installed plugins that publish an OpenAPI document (the manifest's `api.openapi`). */
const usePluginReferences = () => {
  const plugins = useQuery(orpc.plugins.list.queryOptions({ staleTime: Infinity, retry: false }));

  const references = (plugins.data?.data ?? []).flatMap(({ name, manifest, installation }) =>
    installation?.status === 'active' && manifest?.api?.openapi
      ? [
          {
            name,
            title: manifest.title,
            source: { plugin: name, apiUrl: manifest.api.url, openapi: manifest.api.openapi },
          },
        ]
      : [],
  );

  return { references, error: plugins.error };
};

/**
 * Settings › API reference: every endpoint a team member or a customer can call, from
 * core's OpenAPI documents, and each installed plugin's own, with a client to try them.
 */
export const ApiReferencePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const [shown, setShown] = useState<string>('member');
  const navigate = useNavigate();
  const plugins = usePluginReferences();

  const source: ReferenceSource | undefined = isAudience(shown)
    ? { audience: shown }
    : plugins.references.find((plugin) => plugin.name === shown)?.source;

  // Scalar keeps the open operation in the hash; the other reference must start without it.
  const switchTo = (value: string) => {
    void navigate({ hash: '' }, { replace: true });
    setShown(value);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'API reference'),
                to: paths.settings.apiReference,
                icon: IconSourceCode,
              },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {plugins.error && (
            <span className="text-xs text-destructive">
              {t('plugins-failed', "Plugins' references could not load: {{message}}", {
                message: messageOf(plugins.error),
              })}
            </span>
          )}
          <Tabs value={shown} onValueChange={switchTo}>
            <Tabs.List>
              <Tabs.Trigger value="member">{t('member', 'Team member API')}</Tabs.Trigger>
              <Tabs.Trigger value="customer">{t('customer', 'Customer API')}</Tabs.Trigger>
              {plugins.references.map((plugin) => (
                <Tabs.Trigger key={plugin.name} value={plugin.name}>
                  {plugin.title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </PageHeader.End>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {source && <ApiReferenceView source={source} />}
      </div>
    </PageContainer>
  );
};
