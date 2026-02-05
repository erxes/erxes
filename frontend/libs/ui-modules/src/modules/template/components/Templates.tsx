import React, { useState } from 'react';
import { ITemplate, ITemplateFilter } from '../types/types';
import TemplatesList from './TemplatesList';
import TemplateForm from './TemplateForm';
import { useTemplates } from '../hooks/useTemplates';
import {
  PageContainer,
  PageSubHeader,
  Filter,
  Command,
  Combobox,
  useMultiQueryState,
  Button,
  Breadcrumb,
  Separator,
} from 'erxes-ui';
import {
  IconProgressCheck,
  IconUpload,
  IconTemplate,
  IconCheck,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../header';
import { SelectTemplateCategory } from './SelectTemplateCategory';

export const Templates: React.FC = () => {
  const [limit] = useState(20);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(
    null,
  );

  const [queries, setQueries] = useMultiQueryState<{
    status?: string;
    searchValue?: string;
    categoryIds?: string[];
  }>(['status', 'searchValue', 'categoryIds']);

  const { status, searchValue, categoryIds } = queries;

  const {
    templates,
    totalCount,
    loading,
    error,
    refetch,
    fetchMore,
    pageInfo,
  } = useTemplates({
    variables: {
      limit,
      searchValue,
      categoryIds,
      ...(status && status !== 'all' && { status }),
    },
  });

  const handleLoadMore = () => {
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) return;

    fetchMore({
      variables: {
        limit,
        cursor: pageInfo.endCursor,
        searchValue,
        categoryIds,
        ...(status && status !== 'all' && { status }),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          templateList: {
            ...fetchMoreResult.templateList,
            list: [
              ...prev.templateList.list,
              ...fetchMoreResult.templateList.list,
            ],
            pageInfo: fetchMoreResult.templateList.pageInfo,
          },
        };
      },
    });
  };

  const handleEdit = (template: ITemplate) => {
    setEditingTemplate(template);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/template">
                    <IconTemplate />
                    Templates
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>

        <PageHeader.End>
          <Button size="sm" onClick={() => setShowUploadForm(true)}>
            <IconUpload size={16} />
            Upload Template
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader>
        <Filter id="templates-filter">
          <Filter.Bar>
            <Filter.BarItem queryKey="status">
              <Filter.BarName>
                <IconProgressCheck />
                Status
              </Filter.BarName>
              <Filter.BarButton filterKey="status">
                {status === 'active' ? 'Active' : status === 'archived' ? 'Archived' : 'All'}
              </Filter.BarButton>
            </Filter.BarItem>
            <SelectTemplateCategory.FilterBar />
            <Filter.Popover>
              <Filter.Trigger />
              <Combobox.Content>
                <Filter.View>
                  <Command>
                    <Filter.CommandInput placeholder="Filter" variant="secondary" />
                    <Command.List>
                      <Filter.CommandItem onSelect={() => setQueries({ status: '' })}>
                        <IconProgressCheck />
                        Status: All
                        {!status && <IconCheck className="ml-auto" />}
                      </Filter.CommandItem>
                      <Filter.CommandItem onSelect={() => setQueries({ status: 'active' })}>
                        <IconProgressCheck />
                        Status: Active
                        {status === 'active' && <IconCheck className="ml-auto" />}
                      </Filter.CommandItem>
                      <Filter.CommandItem onSelect={() => setQueries({ status: 'archived' })}>
                        <IconProgressCheck />
                        Status: Archived
                        {status === 'archived' && <IconCheck className="ml-auto" />}
                      </Filter.CommandItem>
                      <SelectTemplateCategory.FilterItem />
                    </Command.List>
                  </Command>
                </Filter.View>
                <SelectTemplateCategory.FilterView />
              </Combobox.Content>
            </Filter.Popover>
          </Filter.Bar>
        </Filter>
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount} templates found
        </div>
      </PageSubHeader>
      <TemplatesList
        templates={templates}
        loading={loading}
        error={error}
        totalCount={totalCount}
        hasNextPage={pageInfo?.hasNextPage || false}
        onLoadMore={handleLoadMore}
        onRefetch={refetch}
        onEdit={handleEdit}
      />
      {showUploadForm && (
        <TemplateForm
          onClose={() => setShowUploadForm(false)}
          onSuccess={refetch}
        />
      )}
      {editingTemplate && (
        <TemplateForm
          template={editingTemplate}
          onClose={handleCloseEdit}
          onSuccess={() => {
            refetch();
            handleCloseEdit();
          }}
        />
      )}
    </PageContainer>
  );
};

export default Templates;
