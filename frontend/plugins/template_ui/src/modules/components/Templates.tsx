import React, { useState } from 'react';
import { ITemplate, ITemplateFilter } from '../types/types';
import TemplatesHeader from './TemplatesHeader';
import TemplatesList from './TemplatesList';
import TemplateForm from './TemplateForm';
import { useTemplates } from '../hooks/useTemplates';
import { PageContainer } from 'erxes-ui';

export const Templates: React.FC = () => {
  const [limit] = useState(20);
  const [filter, setFilter] = useState<ITemplateFilter>({ status: 'all' });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(
    null,
  );

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
      searchValue: filter.searchValue,
      categoryIds: filter.categoryIds,
      contentType: filter.contentType,
      ...(filter.status !== 'all' && { status: filter.status }),
    },
  });

  const handleSearch = (searchValue: string) => {
    setFilter({ ...filter, searchValue });
  };

  const handleStatusChange = (status: string) => {
    setFilter({ ...filter, status });
  };

  const handleLoadMore = () => {
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) return;

    fetchMore({
      variables: {
        limit,
        cursor: pageInfo.endCursor,
        searchValue: filter.searchValue,
        categoryIds: filter.categoryIds,
        contentType: filter.contentType,
        ...(filter.status !== 'all' && { status: filter.status }),
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
      <TemplatesHeader
        onSearch={() => {}}
        onUpload={() => setShowUploadForm(true)}
        onStatusChange={handleStatusChange}
        currentStatus={filter.status}
      />
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
