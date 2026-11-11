import { AutomationSettingsBreadcrumb } from '@/automations/components/settings/components/AutomationSettingsBreadcrumb';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { Breadcrumb, Button } from 'erxes-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from 'ui-modules';

export const AutomationBotsHeader = ({
  label,
  children,
}: Readonly<{ label?: string; children?: ReactNode }>) => {
  const { t } = useTranslation('automations');
  return (
    <PageHeader>
      <PageHeader.Start className="min-w-0 flex-1 pr-0">
        <Breadcrumb>
          <Breadcrumb.List className="flex-nowrap gap-1">
            <Breadcrumb.Item>
              <AutomationSettingsBreadcrumb />
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={AutomationSettingsPath.Bots}>
                  {t('settings-bots')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {label && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item className="min-w-0">
                  <Breadcrumb.Page className="truncate px-3" title={label}>
                    {label}
                  </Breadcrumb.Page>
                </Breadcrumb.Item>
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      {children && <PageHeader.End>{children}</PageHeader.End>}
    </PageHeader>
  );
};
