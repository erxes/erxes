import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AutomationsViewToggle } from '@/automations/components/list/AutomationsViewToggle';
import { getWorkflowTemplateColumns } from '@/automations/components/templates/WorkflowTemplateColumns';
import {
  TWorkflowTemplate,
  useWorkflowTemplateList,
} from '@/automations/hooks/useWorkflowTemplateList';
import { IconAffiliate, IconArrowsSplit2 } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Empty,
  RecordTable,
  Separator,
  toast,
} from 'erxes-ui';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { PageHeader } from 'ui-modules';

export const WorkflowTemplatesList = () => {
  const { templates, loading, error, refetch, editTemplate, removeTemplate } =
    useWorkflowTemplateList();

  const handleRename = async (template: TWorkflowTemplate, name: string) => {
    try {
      await editTemplate({ variables: { _id: template._id, name } });
      toast({ title: 'Template updated' });
    } catch (error: any) {
      toast({
        title: 'Failed to rename template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns = useMemo(
    () =>
      getWorkflowTemplateColumns({
        onRename: handleRename,
        onRemove: removeTemplate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [removeTemplate],
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
                  Automations
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <AutomationsViewToggle />
        </PageHeader.Start>
        <PageHeader.End>
          <Button asChild>
            <Link to="/automations/templates/create">Create template</Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {error ? (
        <AutomationErrorEmptyState
          title="Couldn't load workflow templates"
          error={error}
          onRetry={() => refetch()}
        />
      ) : !loading && templates.length === 0 ? (
        <WorkflowTemplatesEmptyState />
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

const WorkflowTemplatesEmptyState = () => (
  <Empty className="my-8">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconArrowsSplit2 />
      </Empty.Media>
      <Empty.Title>No workflow templates yet</Empty.Title>
      <Empty.Description>
        Build a reusable set of actions once, then drop it into any automation.
      </Empty.Description>
    </Empty.Header>
    <Empty.Content>
      <Button asChild>
        <Link to="/automations/templates/create">Create template</Link>
      </Button>
    </Empty.Content>
  </Empty>
);
