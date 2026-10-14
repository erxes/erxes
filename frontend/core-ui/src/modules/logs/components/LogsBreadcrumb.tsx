import { IconChartPie } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const LogsBreadcrumb = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item aria-current="page">
              <Button
                variant="ghost"
                asChild
                className="cursor-default hover:bg-transparent"
              >
                <span>
                  <IconChartPie />
                  {t('system-logs')}
                </span>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
    </PageHeader>
  );
};
