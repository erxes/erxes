import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { useAutomationsListLayout } from '@/automations/components/list/AutomationsDisplayControl';
import { AutomationsViewToggle } from '@/automations/components/list/AutomationsViewToggle';
import { WorkflowTemplatesCardList } from '@/automations/components/templates/WorkflowTemplatesCardList';
import {
  useWorkflowTemplateFilters,
  WorkflowTemplateFilters,
} from '@/automations/components/templates/WorkflowTemplateFilters';
import { getWorkflowTemplateColumns } from '@/automations/components/templates/WorkflowTemplateColumns';
import {
  TWorkflowTemplate,
  useWorkflowTemplateList,
} from '@/automations/hooks/useWorkflowTemplateList';
import {
  IconAffiliate,
  IconArrowsSplit2,
  IconSearch,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Empty,
  RecordTable,
  Separator,
  toast,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from 'ui-modules';

export const WorkflowTemplatesList = () => {
  const { searchValue } = useWorkflowTemplateFilters();
  const { templates, loading, error, refetch, editTemplate, removeTemplate } =
    useWorkflowTemplateList({ searchValue });
  const { t } = useTranslation('automations');
  const { layout } = useAutomationsListLayout();

  const handleRename = async (template: TWorkflowTemplate, name: string) => {
    try {
      await editTemplate({ variables: { _id: template._id, name } });
      toast({ title: t('template-updated') });
    } catch (error: any) {
      toast({
        title: t('template-rename-failed'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns = useMemo(
    () =>
      getWorkflowTemplateColumns({
        t,
        onRename: handleRename,
        onRemove: removeTemplate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [removeTemplate, t],
  );

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
          <AutomationsViewToggle />
        </PageHeader.Start>
        <PageHeader.End>
          <Button asChild>
            <Link to="/automations/templates/create">
              {t('create-template')}
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <WorkflowTemplateFilters
        totalCount={templates.length}
        loading={loading}
      />

      {error ? (
        <AutomationErrorEmptyState
          title={t('templates-load-error')}
          error={error}
          onRetry={() => refetch()}
        />
      ) : !loading && templates.length === 0 ? (
        <WorkflowTemplatesEmptyState isFiltered={!!searchValue} />
      ) : layout === 'grid' ? (
        <WorkflowTemplatesCardList
          templates={templates}
          loading={loading}
          onRemove={removeTemplate}
        />
      ) : (
        <RecordTable.Provider
          data={templates}
          columns={columns}
          stickyColumns={['more', 'name']}
          className="m-3"
        >
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
                {loading && <RecordTable.RowSkeleton rows={10} />}
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTable.Provider>
      )}
    </>
  );
};

const WorkflowTemplatesEmptyState = ({
  isFiltered,
}: {
  isFiltered?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Empty className="my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          {isFiltered ? <IconSearch /> : <IconArrowsSplit2 />}
        </Empty.Media>
        <Empty.Title>
          {t(
            isFiltered
              ? 'templates-empty-search-title'
              : 'templates-empty-title',
          )}
        </Empty.Title>
        <Empty.Description>
          {t(
            isFiltered
              ? 'templates-empty-search-description'
              : 'templates-empty-description',
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltered && (
        <Empty.Content>
          <Button asChild>
            <Link to="/automations/templates/create">
              {t('create-template')}
            </Link>
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
