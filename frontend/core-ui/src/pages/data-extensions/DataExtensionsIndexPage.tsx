import {
  IconArchive,
  IconPencil,
  IconPlus,
  IconVariable,
  IconWebhook,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  Spinner,
  Tabs,
  toast,
  useConfirm,
  useIsMobile,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, useSelectedDataExtensionRecordType } from 'ui-modules';
import { DataExtensionApiPreview } from '@/data-extensions/components/DataExtensionApiPreview';
import { DataExtensionFieldsTable } from '@/data-extensions/components/DataExtensionFieldsTable';
import { DataExtensionModelMap } from '@/data-extensions/components/DataExtensionModelMap';
import { DataExtensionObjectSheet } from '@/data-extensions/components/DataExtensionObjectSheet';
import { DataExtensionWebhooksSheet } from '@/data-extensions/components/DataExtensionWebhooksSheet';
import { DataExtensionRecordsView } from '@/data-extensions/components/DataExtensionRecordsView';
import { DataExtensionRecordValues } from '@/data-extensions/components/DataExtensionRecordValues';
import { DataExtensionsMobileSidebar } from '@/data-extensions/components/DataExtensionsSidebar';
import {
  DataExtensionEmptyState,
  DataExtensionErrorState,
} from '@/data-extensions/components/DataExtensionStates';
import {
  useDataExtensionObjectMutations,
  useDataExtensionObjects,
} from '@/data-extensions/hooks/useDataExtensionObjects';
import { useDataExtensionPermissions } from '@/data-extensions/hooks/useDataExtensionPermissions';

const TABS = ['records', 'fields', 'map', 'values', 'api'] as const;

type Tab = (typeof TABS)[number];

export const DataExtensionsIndexPage = () => {
  const { t } = useTranslation('dataExtensions');
  const isMobile = useIsMobile();
  const { canManage } = useDataExtensionPermissions();
  const { recordType, recordTypes, loading, error, refetch } =
    useSelectedDataExtensionRecordType();
  const [tabParam, setTabParam] = useQueryState<string>('tab');
  const [, setRecordTypeParam] = useQueryState<string>('recordType');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [objectSheetOpen, setObjectSheetOpen] = useState(false);
  const [webhooksOpen, setWebhooksOpen] = useState(false);
  const { confirm } = useConfirm();
  const { objects } = useDataExtensionObjects();
  const { archiveObject } = useDataExtensionObjectMutations();
  const custom = Boolean(recordType?.custom);
  const object = custom
    ? objects.find((candidate) => candidate.recordType === recordType?.recordType)
    : undefined;
  // Custom objects open on their records; module records on their fields.
  // A custom object's records are its own list, so it has no lookup tab.
  const available: Tab[] = custom
    ? ['records', 'fields', 'map', 'api']
    : ['fields', 'map', 'values', 'api'];
  const tab: Tab = available.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : available[0];

  const archive = () =>
    object &&
    confirm({
      message: t('objects.archive-confirm', { label: object.pluralLabel }),
      options: {
        description: t('objects.archive-confirm-description'),
        okLabel: t('archive'),
      },
    }).then(async () => {
      try {
        await archiveObject(object._id);
        setRecordTypeParam(null);
        toast({
          variant: 'success',
          title: t('objects.toast.archived', { label: object.pluralLabel }),
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('objects.toast.action-failed'),
          description: error instanceof Error ? error.message : undefined,
        });
      }
    });

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
          {available.map((value) => (
            <Tabs.Trigger key={value} value={value}>
              {t(`tabs.${value}`)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {custom && (
          <Tabs.Content
            value="records"
            className="min-h-0 flex-auto motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
          >
            <DataExtensionRecordsView recordType={recordType} />
          </Tabs.Content>
        )}
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
          {canManage && (
            <>
              <Button
                variant="ghost"
                aria-label={t('webhooks.title')}
                onClick={() => setWebhooksOpen(true)}
              >
                <IconWebhook />
                <span className="hidden lg:inline">{t('webhooks.title')}</span>
              </Button>
              <DataExtensionWebhooksSheet
                open={webhooksOpen}
                onOpenChange={setWebhooksOpen}
              />
            </>
          )}
          {canManage && object && (
            <>
              <Button
                variant="ghost"
                aria-label={t('objects.edit')}
                onClick={() => setObjectSheetOpen(true)}
              >
                <IconPencil />
                <span className="hidden md:inline">{t('objects.edit')}</span>
              </Button>
              <Button
                variant="ghost"
                aria-label={t('objects.archive')}
                onClick={archive}
              >
                <IconArchive />
                <span className="hidden md:inline">{t('objects.archive')}</span>
              </Button>
              <DataExtensionObjectSheet
                open={objectSheetOpen}
                onOpenChange={setObjectSheetOpen}
                object={object}
              />
            </>
          )}
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
