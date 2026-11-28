import { type PluginApiAudience } from '@erxes/core-contract';
import { messageOf } from '@erxes/core-contract/client';
import { IconSourceCode } from '@tabler/icons-react';
import { PageContainer, PageHeader, AppBreadcrumb } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { type ApiGroup, ApiReferencePicker } from './ApiReferencePicker';
import {
  API_AUDIENCES,
  type ApiAudience,
  ApiReferenceView,
  type ReferenceSource,
} from './ApiReferenceView';
import { usePluginReferences } from './pluginReferences';

const isAudience = (value: string): value is ApiAudience =>
  API_AUDIENCES.some((audience) => audience === value);

/** The names of the APIs, by who calls them. */
const useAudienceLabels = (): Record<PluginApiAudience, string> => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });

  return {
    member: t('member', 'Team member API'),
    customer: t('customer', 'Customer API'),
    employee: t('employee', 'Employee API'),
    portal: t('portal', 'Portal API'),
  };
};

/**
 * Settings › API reference: every endpoint a team member or a customer can call, from
 * core's OpenAPI documents, and each installed plugin's own (for its members, customers or
 * portals), with a client to try them. The address names the one shown:
 * `/settings/api-reference/<member|customer>` or `/settings/api-reference/<plugin>/<audience>`.
 */
export const ApiReferencePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const { api = 'member', audience } = useParams();
  const navigate = useNavigate();
  const labels = useAudienceLabels();
  const plugins = usePluginReferences();
  const references = plugins.data ?? [];
  const plugin = references.find((entry) => entry.name === api);

  // A plugin's address without an audience opens its first document.
  const doc =
    plugin?.docs.find((entry) => entry.audience === audience) ??
    (audience ? undefined : plugin?.docs[0]);

  const key = plugin && doc ? `${plugin.name}/${doc.audience}` : api;

  const source: ReferenceSource | undefined =
    isAudience(api) && !audience ? { audience: api } : doc?.source;

  const groups: ApiGroup[] = [
    {
      heading: t('core', 'Core'),
      choices: API_AUDIENCES.map((value) => ({
        key: value,
        label: labels[value],
        title: labels[value],
        to: paths.settings.apiReferenceOf(value),
      })),
    },
    ...references.map((entry) => ({
      heading: entry.title,
      choices: entry.docs.map((item) => ({
        key: `${entry.name}/${item.audience}`,
        label: labels[item.audience],
        title: `${entry.title} · ${labels[item.audience]}`,
        to: paths.settings.apiReferenceOf(entry.name, item.audience),
      })),
    })),
  ];

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
            <span className="text-xs text-destructive-text">
              {t('plugins-failed', "Plugins' APIs could not load: {{message}}", {
                message: messageOf(plugins.error),
              })}
            </span>
          )}
          <ApiReferencePicker
            value={key}
            groups={groups}
            onChange={(choice) => void navigate(choice.to)}
          />
        </PageHeader.End>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {source && <ApiReferenceView key={key} source={source} />}
      </div>
    </PageContainer>
  );
};
