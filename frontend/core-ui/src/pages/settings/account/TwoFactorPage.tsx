import { IconDeviceMobileCheck } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { TwoFactorAccount } from '@/settings/two-factor/components/TwoFactorAccount';
import { SettingsPath } from '@/types/paths/SettingsPath';

export const TwoFactorPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderStart>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={SettingsPath.TwoFactor} aria-current="page">
                    <IconDeviceMobileCheck />
                    {t('title')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeaderStart>
      </PageHeader>
      <ScrollArea className="h-full">
        <section className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
          <TwoFactorAccount />
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
