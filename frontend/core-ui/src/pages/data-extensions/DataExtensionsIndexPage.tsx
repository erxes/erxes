import { IconPlus, IconVariable } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  Spinner,
  Tabs,
  toast,
  useIsMobile,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, useSelectedDataExtensionRecordType } from 'ui-modules';
import { DataExtensionApiPreview } from '@/data-extensions/components/DataExtensionApiPreview';
import { DataExtensionFieldsTable } from '@/data-extensions/components/DataExtensionFieldsTable';
import { DataExtensionModelMap } from '@/data-extensions/components/DataExtensionModelMap';
import { DataExtensionRecordValues } from '@/data-extensions/components/DataExtensionRecordValues';
import { DataExtensionsMobileSidebar } from '@/data-extensions/components/DataExtensionsSidebar';
import {
  DataExtensionEmptyState,
  DataExtensionErrorState,
} from '@/data-extensions/components/DataExtensionStates';
import { useDataExtensionPermissions } from '@/data-extensions/hooks/useDataExtensionPermissions';

const TABS = ['fields', 'map', 'values', 'api'] as const;

type Tab = (typeof TABS)[number];

export const DataExtensionsIndexPage = () => {
  const { t } = useTranslation('dataExtensions');
  const isMobile = useIsMobile();
  const { canManage } = useDataExtensionPermissions();
  const { recordType, recordTypes, loading, error, refetch } =
    useSelectedDataExtensionRecordType();
  const [tabParam, setTabParam] = useQueryState<string>('tab');
  const [sheetOpen, setSheetOpen] = useState(false);
  const tab: Tab = TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'fields';

  const renderContent = () => {
    if (loading && !recordTypes.length) {
      return <Spinner />;
    }

    if (error) {
      return (
        <DataExtensionErrorState
          error={error}
          onRetry={() =>
            refetch().catch(() =>
              toast({ variant: 'destructive', title: t('error-description') }),
            )
          }
        />
      );
    }

    if (!recordType) {
      return (
        <DataExtensionEmptyState
          icon={<IconVariable />}
          title={t('empty.record-types-title')}
          description={t('empty.record-types-description')}
        />
      );
    }

    return (
      <Tabs
        value={tab}
        onValueChange={(value) => setTabParam(value)}
        className="flex h-full min-h-0 flex-col"
      >
        <Tabs.List className="mx-3 mt-2 w-fit">
          <Tabs.Trigger value="fields">{t('tabs.fields')}</Tabs.Trigger>
          <Tabs.Trigger value="map">{t('tabs.map')}</Tabs.Trigger>
          <Tabs.Trigger value="values">{t('tabs.values')}</Tabs.Trigger>
          <Tabs.Trigger value="api">{t('tabs.api')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="fields"
          className="min-h-0 flex-auto motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
        >
          <DataExtensionFieldsTable
            recordType={recordType}
            sheetOpen={sheetOpen}
            onSheetOpenChange={setSheetOpen}
          />
        </Tabs.Content>
        <Tabs.Content
          value="map"
          className="min-h-0 flex-auto motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
        >
          <DataExtensionModelMap
            recordTypes={recordTypes}
            selected={recordType.recordType}
          />
        </Tabs.Content>
        <Tabs.Content
          value="values"
          className="min-h-0 flex-auto motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
        >
          <DataExtensionRecordValues recordType={recordType} />
        </Tabs.Content>
        <Tabs.Content
          value="api"
          className="min-h-0 flex-auto motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
        >
          <DataExtensionApiPreview recordType={recordType} />
        </Tabs.Content>
      </Tabs>
    );
  };

  return (
    <PageContainer className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button
                  variant="ghost"
                  asChild
                  className="cursor-default hover:bg-transparent"
                >
                  <span>
                    <IconVariable />
                    {t('title')}
                  </span>
                </Button>
              </Breadcrumb.Item>
              {recordType && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>
                      {t(
                        `record-types.${recordType.recordType}`,
                        recordType.label,
                      )}
                    </Breadcrumb.Page>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          {canManage && recordType && (
            <Button
              aria-label={t('add-field')}
              onClick={() => {
                setTabParam('fields');
                setSheetOpen(true);
              }}
            >
              <IconPlus />
              <span className="hidden sm:inline">{t('add-field')}</span>
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <div className="flex h-full min-h-0 flex-col">
        {isMobile && recordTypes.length > 0 && <DataExtensionsMobileSidebar />}
        <div className="min-h-0 min-w-0 flex-auto">{renderContent()}</div>
      </div>
    </PageContainer>
  );
};
