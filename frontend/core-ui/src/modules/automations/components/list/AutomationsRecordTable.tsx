import { getAutomationColumns } from '@/automations/components/list/AutomationColumns';
import { AutomationRecordTableFilters } from '@/automations/components/list/filters/AutomationRecordTableFilters';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { useAutomationsListFilterMemory } from '@/automations/hooks/useAutomationsListFilterMemory';
import { AutomationsRecordTableContent } from '@/automations/components/list/AutomationsRecordTableContent';
import { AutomationsRecordTableEmptyState } from '@/automations/components/list/AutomationsRecordTableEmptyState';
import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AutomationsCardList } from '@/automations/components/list/AutomationsCardList';
import { AutomationFolderCards } from '@/automations/components/list/folders/AutomationFolderCards';
import { AutomationFolderCreateButton } from '@/automations/components/list/folders/AutomationFolderCreateButton';
import { AutomationFolderEmptyState } from '@/automations/components/list/folders/AutomationFolderEmptyState';
import { useAutomationFolderView } from '@/automations/hooks/useAutomationFolderView';
import { useAutomationsListLayout } from '@/automations/components/list/AutomationsDisplayControl';
import {
  IconAffiliate,
  IconFolder,
  IconSettings,
  IconTemplate,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Spinner,
  Kbd,
  useScopedHotkeys,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationsHotKeyScope } from '@/automations/types';
import { setAutomationSettingsReturnPath } from '@/automations/utils/settingsReturn';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { Link, useNavigate } from 'react-router-dom';
import {
  Can,
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
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('automations'));
  const navigate = useNavigate();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canCreateAutomation =
    isLoaded && hasActionPermission('automationsCreate');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canCreateAutomation) return;
      navigate('/automations/create');
    },
    AutomationsHotKeyScope.AutomationsPage,
    [canCreateAutomation, navigate],
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
          {!folderId && <AutomationFolderCreateButton />}
          <Button variant="outline" asChild>
            <Link
              to={AutomationSettingsPath.Index}
              onClick={() => setAutomationSettingsReturnPath('/automations')}
            >
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
          <Can action="templatesInstall">
            <Button variant="outline" asChild>
              <Link to="/templates?group=automation">
                <IconTemplate />
                {t('from-template')}
              </Link>
            </Button>
          </Can>
          <Can action="automationsCreate">
            <Button asChild>
              <Link to={'/automations/create'}>
                {t('create')}
                <Kbd>C</Kbd>
              </Link>
            </Button>
          </Can>
        </PageHeader.End>
      </PageHeader>
      <AutomationRecordTableFilters loading={loading} totalCount={totalCount} />
      {showFolders && !error && (
        <AutomationFolderCards folders={folders} onOpen={openFolder} />
      )}
      {error ? (
        <AutomationErrorEmptyState
          title={t('automations-load-error')}
          error={error}
          onRetry={() => refetch()}
        />
      ) : list.length === 0 ? (
        folderId || (showFolders && folders.length) ? (
          <AutomationFolderEmptyState inFolder={!!folderId} />
        ) : (
          <AutomationsRecordTableEmptyState />
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
          list={list}
          loading={loading}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          handleFetchMore={handleFetchMore}
        />
      )}
    </>
  );
};
