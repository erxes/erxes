import { getAutomationColumns } from '@/automations/components/list/AutomationColumns';
import { AutomationRecordTableFilters } from '@/automations/components/list/filters/AutomationRecordTableFilters';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { AutomationsRecordTableContent } from '@/automations/components/list/AutomationsRecordTableContent';
import { AutomationsRecordTableEmptyState } from '@/automations/components/list/AutomationsRecordTableEmptyState';
import { IconAffiliate, IconSettings } from '@tabler/icons-react';
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
import { Link, useNavigate } from 'react-router-dom';
import { Can, PageHeader, usePermissionCheck } from 'ui-modules';

export const AutomationsRecordTable = () => {
  const {
    list,
    loading,
    totalCount,
    hasNextPage,
    handleFetchMore,
    hasPreviousPage,
  } = useAutomationsRecordTable();

  const { t } = useTranslation('automations');
  const columns = useMemo(() => getAutomationColumns(t), [t]);
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
                <Button variant="ghost">
                  <IconAffiliate />
                  {t('automations')}
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/automations">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
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
      {list.length === 0 ? (
        <AutomationsRecordTableEmptyState />
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
