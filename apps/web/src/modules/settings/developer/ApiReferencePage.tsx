import { messageOf } from '@erxes/core-contract/client';
import { IconSourceCode } from '@tabler/icons-react';
import { PageContainer, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { ApiReferencePicker } from './ApiReferencePicker';
import { type ApiAudience, ApiReferenceView, type ReferenceSource } from './ApiReferenceView';
import { usePluginReferences } from './pluginReferences';

const isAudience = (value: string): value is ApiAudience =>
  value === 'member' || value === 'customer';

/**
 * Settings › API reference: every endpoint a team member or a customer can call, from
 * core's OpenAPI documents, and each installed plugin's own, with a client to try them.
 * The address names the one shown (`/settings/api-reference/<api>`), so a link opens it.
 */
export const ApiReferencePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const { api = 'member' } = useParams();
  const navigate = useNavigate();
  const plugins = usePluginReferences();
  const references = plugins.data ?? [];

  const source: ReferenceSource | undefined = isAudience(api)
    ? { audience: api }
    : references.find((plugin) => plugin.name === api)?.source;

  if (!source && !plugins.isPending) return <NotFoundPage />;

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
              {t('plugins-failed', "Plugins' APIs could not load: {{message}}", {
                message: messageOf(plugins.error),
              })}
            </span>
          )}
          <ApiReferencePicker
            value={api}
            core={[
              { value: 'member', label: t('member', 'Team member API') },
              { value: 'customer', label: t('customer', 'Customer API') },
            ]}
            plugins={references.map((plugin) => ({
              value: plugin.name,
              label: t('plugin-api', '{{title}} API', { title: plugin.title }),
            }))}
            onChange={(value) => void navigate(paths.settings.apiReferenceOf(value))}
          />
        </PageHeader.End>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {source && <ApiReferenceView key={api} source={source} />}
      </div>
    </PageContainer>
  );
};
