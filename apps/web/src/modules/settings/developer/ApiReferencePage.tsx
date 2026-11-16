import { IconSourceCode } from '@tabler/icons-react';
import { PageContainer, PageHeader, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { type ApiAudience, ApiReferenceView } from './ApiReferenceView';

const isAudience = (value: string): value is ApiAudience =>
  value === 'member' || value === 'customer';

/**
 * Settings › API reference: every endpoint a team member or a customer can call, from
 * core's OpenAPI documents, with a client to try them. Plugins' references have their own
 * pages (`PluginApiReferencePage`).
 */
export const ApiReferencePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const [audience, setAudience] = useState<ApiAudience>('member');
  const navigate = useNavigate();

  // Scalar keeps the open operation in the hash; the other reference must start without it.
  const switchTo = (value: string) => {
    if (!isAudience(value)) return;

    void navigate({ hash: '' }, { replace: true });
    setAudience(value);
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
          <Tabs value={audience} onValueChange={switchTo}>
            <Tabs.List>
              <Tabs.Trigger value="member">{t('member', 'Team member API')}</Tabs.Trigger>
              <Tabs.Trigger value="customer">{t('customer', 'Customer API')}</Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </PageHeader.End>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ApiReferenceView source={{ audience }} />
      </div>
    </PageContainer>
  );
};
