import { IconChartPie } from '@tabler/icons-react';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';

export const LogsBreadcrumb = () => {
  const { t } = useTranslation('common');
  return (
    <PageHeader className="p-3 mx-0" separatorClassName="mb-0">
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item aria-current="page">
              <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
                <IconChartPie className="w-5 h-5" />
                {t('logs.system-logs', 'System Logs')}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
      </PageHeader.Start>
    </PageHeader>
  );
};

