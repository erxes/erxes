import { getAutomationColumns } from '@/automations/components/list/AutomationColumns';
import { AutomationRecordTableFilters } from '@/automations/components/list/filters/AutomationRecordTableFilters';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { useAutomationsListFilterMemory } from '@/automations/hooks/useAutomationsListFilterMemory';
import { AutomationsRecordTableContent } from '@/automations/components/list/AutomationsRecordTableContent';
import { AutomationsRecordTableEmptyState } from '@/automations/components/list/AutomationsRecordTableEmptyState';
import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AutomationsCardList } from '@/automations/components/list/AutomationsCardList';
import { AutomationFolderCards } from '@/automations/components/list/folders/AutomationFolderCards';
import { AutomationFolderEmptyState } from '@/automations/components/list/folders/AutomationFolderEmptyState';
import { useAutomationFolderView } from '@/automations/hooks/useAutomationFolderView';
import { useAutomationsListLayout } from '@/automations/hooks/useAutomationsListLayout';
import { AutomationCreateDialog } from '@/automations/components/list/AutomationCreateDialog';
import { AutomationCreateMenu } from '@/automations/components/list/AutomationCreateMenu';
import { useAutomationListRows } from '@/automations/hooks/useAutomationListRows';
import { useAutomationCreateDialog } from '@/automations/hooks/useAutomationCreateDialog';
import { IconAffiliate, IconFolder } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Spinner,
  useScopedHotkeys,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  PageHeader,
  createFavoriteBreadcrumb,
  usePermissionCheck,
} from 'ui-modules';

export const AutomationsRecordTable = () => {
  useAutomationsListFilterMemory();
  const {
    list,
    loading,
    error,
    refetch,
    totalCount,
    hasNextPage,
    handleFetchMore,
    hasPreviousPage,
  } = useAutomationsRecordTable();

  const { t } = useTranslation('automations');
  const { layout } = useAutomationsListLayout();
  const { folderId, folder, folders, showFolders, openFolder } =
    useAutomationFolderView();
  const columns = useMemo(() => getAutomationColumns(t), [t]);
  // Folders are rows of the table; the card view keeps them as cards above
  const isTable = layout !== 'grid';
  const { rows, automationIds, openFolderIds } = useAutomationListRows({
    list,
    folders,
    showFolders: isTable && showFolders && !error,
  });
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('automations'));
  const createDialog = useAutomationCreateDialog();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canCreateAutomation =
    isLoaded && hasActionPermission('automationsCreate');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canCreateAutomation) return;
      createDialog.openDialog();
    },
    AutomationsHotKeyScope.AutomationsPage,
    [canCreateAutomation, createDialog.openDialog],
  );
  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" onClick={() => openFolder(null)}>
                  <IconAffiliate />
                  {t('automations')}
                </Button>
              </Breadcrumb.Item>
              {folderId && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Button variant="ghost">
                      <IconFolder />
                      {folder?.name || t('folder')}
                    </Button>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconAffiliate"
          />
        </PageHeader.Start>
        <PageHeader.End>
          <AutomationCreateMenu onCreateAutomation={createDialog.openDialog} />
        </PageHeader.End>
      </PageHeader>
      <AutomationCreateDialog state={createDialog} />
      <AutomationRecordTableFilters loading={loading} totalCount={totalCount} />
      {!isTable && showFolders && !error && (
        <AutomationFolderCards folders={folders} onOpen={openFolder} />
      )}
      {error ? (
        <AutomationErrorEmptyState
          title={t('automations-load-error')}
          error={error}
          onRetry={() => refetch()}
        />
      ) : rows.length === 0 ? (
        folderId || (showFolders && folders.length) ? (
          <AutomationFolderEmptyState inFolder={!!folderId} />
        ) : (
          <AutomationsRecordTableEmptyState
            onCreate={createDialog.openDialog}
          />
        )
      ) : layout === 'grid' ? (
        <AutomationsCardList
          list={list}
          loading={loading}
          hasNextPage={hasNextPage}
          handleFetchMore={handleFetchMore}
        />
      ) : (
        <AutomationsRecordTableContent
          columns={columns}
          rows={rows}
          automationIds={automationIds}
          openFolderIds={openFolderIds}
          listLength={list.length}
          loading={loading}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          handleFetchMore={handleFetchMore}
        />
      )}
    </>
  );
};
