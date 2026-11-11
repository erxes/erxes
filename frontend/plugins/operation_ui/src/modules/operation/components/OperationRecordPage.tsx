import {
  IconAlignLeft,
  IconHistory,
  IconInfoCircle,
  IconListDetails,
} from '@tabler/icons-react';
import { Button, Empty, PageContainer, Spinner, useQueryState } from 'erxes-ui';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IRecordSidePanelTab, PageHeader, RecordSidePanel } from 'ui-modules';

interface OperationRecordPageProps {
  recordId: string;
  breadcrumb: ReactNode;
  actions?: ReactNode;
  title: ReactNode;
  fields: ReactNode;
  description: ReactNode;
  activity: ReactNode;
  extraTabs?: IRecordSidePanelTab[];
  found: boolean;
  loading: boolean;
  error?: Error;
  notFoundLabel: string;
  onRetry?: () => void;
}

export const OperationRecordPage = ({
  recordId,
  breadcrumb,
  actions,
  title,
  fields,
  description,
  activity,
  extraTabs = [],
  found,
  loading,
  error,
  notFoundLabel,
  onRetry,
}: OperationRecordPageProps): ReactElement => {
  const { t } = useTranslation('operation');
  const [tab, setTab] = useQueryState<string>('tab');
  const tabs: IRecordSidePanelTab[] = [
    {
      value: 'fields',
      label: t('details', 'Details'),
      icon: IconListDetails,
      content: fields,
    },
    {
      value: 'description',
      label: t('description', 'Description'),
      icon: IconAlignLeft,
      content: description,
    },
    {
      value: 'activity',
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: activity,
    },
    ...extraTabs,
  ];
  const activeTab =
    tab && tabs.some((entry) => entry.value === tab) ? tab : 'description';

  const renderBody = (): ReactNode => {
    if (loading && !found) return <Spinner containerClassName="py-12" />;
    if (!found) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty role={error ? 'alert' : undefined}>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconInfoCircle />
              </Empty.Media>
              <Empty.Title>
                {error
                  ? t('failed-to-load-record', 'Failed to load record')
                  : notFoundLabel}
              </Empty.Title>
              {error && <Empty.Description>{error.message}</Empty.Description>}
            </Empty.Header>
            {error && onRetry && (
              <Empty.Content>
                <Button variant="secondary" onClick={onRetry}>
                  {t('retry', 'Retry')}
                </Button>
              </Empty.Content>
            )}
          </Empty>
        </div>
      );
    }

    return (
      <RecordSidePanel.Tabs
        key={recordId}
        value={activeTab}
        onValueChange={setTab}
        visibleCount={2 + extraTabs.length}
        overviewTab="fields"
        expandedDefaultTab="description"
        overviewHeader={
          <div className="min-w-0 flex-1 truncate text-sm">{title}</div>
        }
        tabs={tabs}
      />
    );
  };

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start>{breadcrumb}</PageHeader.Start>
          <PageHeader.End>{actions}</PageHeader.End>
        </PageHeader>
        {renderBody()}
      </RecordSidePanel>
    </PageContainer>
  );
};
