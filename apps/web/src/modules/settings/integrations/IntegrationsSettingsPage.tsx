import { IconPlugConnected } from '@tabler/icons-react';
import { PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { EbarimtCard } from './EbarimtCard';

/** Core's integrations, one card each; a new one adds its card here. */
const INTEGRATIONS = [{ key: 'ebarimt', Card: EbarimtCard }];

/** Settings › Integrations: outside services core connects to for the organisation. */
export const IntegrationsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!useCan()('integrations.manage')) return <Navigate to={paths.settings.root} replace />;

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
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          {INTEGRATIONS.map(({ key, Card }) => (
            <Card key={key} />
          ))}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
