import { usePagePanelContext } from '@/side-panel/hooks/usePagePanel';
import { IconChartPie } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader, RecordSidePanel, SegmentUnsavedBadge } from 'ui-modules';

export const SegmentDetailHeader = ({ title }: { title: string }) => {
  const entry = usePagePanelContext();
  const { t } = useTranslation('segment');
  if (!entry.page) {
    return (
      <RecordSidePanel.Header
        title={title}
        {...entry.headerProps}
        actions={<SegmentUnsavedBadge />}
      />
    );
  }
  return (
    <PageHeader>
      <PageHeader.Start className="min-w-0 flex-1 pr-0">
        <Breadcrumb>
          <Breadcrumb.List className="flex-nowrap gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" onClick={entry.onClose}>
                <IconChartPie />
                {t('segments')}
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item className="min-w-0">
              <Breadcrumb.Page className="truncate px-3" title={title}>
                {title}
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        <SegmentUnsavedBadge />
      </PageHeader.End>
    </PageHeader>
  );
};
