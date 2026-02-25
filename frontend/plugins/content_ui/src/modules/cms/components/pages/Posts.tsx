import { Button, RecordTable, CommandBar, Separator, toast } from 'erxes-ui';
import { Popover, Combobox, Command } from 'erxes-ui';
import { MultipleSelector, Spinner } from 'erxes-ui';
import { PopoverScoped } from 'erxes-ui';
import { RecordTableInlineCell } from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconLayoutGrid,
  IconList,
  IconEye,
  IconEdit,
  IconTrash,
  IconFile,
  IconSearch,
  IconCalendarPlus,
  IconCalendarUp,
  IconFilter,
  IconDots,
  IconArrowsSort,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import { usePosts } from '../../hooks/usePosts';
import { useMutation } from '@apollo/client';
import { CMS_POSTS_EDIT } from '../../graphql/queries';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useTags } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';
import { usePostMutations } from '../../hooks/usePostMutations';
import { useQuery } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPES } from '../../graphql/queries';

export function Posts() {
  const { t } = useTranslation();
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState<string | undefined>(
    'scheduledDate',
  );
  const [sortDirection, setSortDirection] = useState<string | undefined>(
    'desc',
  );
  const perPage = 20;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCursor(undefined);
    setDirection(undefined);
    setCurrentPage(1);
  };

  const sessionKey = `posts-filter-${websiteId}`;

  const {
    posts,
    loading,
    error,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    endCursor,
    startCursor,
    refetch: refetchPosts,
  } = usePosts({
    clientPortalId: websiteId || '',
    type: typeFilter,
    perPage,
    page: currentPage,
    searchValue,
    status: statusFilter as any,
    categoryIds: categoryFilters.length ? categoryFilters : undefined,
    tagIds: tagFilters.length ? tagFilters : undefined,
    cursor,
    sortField,
    sortDirection,
  });

  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return posts;
    const sorted = [...posts].sort((a: any, b: any) => {
      const field = sortField || 'scheduledDate';
      let aVal: string;
      let bVal: string;
      if (field === 'scheduledDate') {
        aVal = a.scheduledDate || a.createdAt;
        bVal = b.scheduledDate || b.createdAt;
      } else {
        aVal = a[field] || '';
        bVal = b[field] || '';
      }
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
    });
    return sorted;
  }, [posts, sortField, sortDirection]);

  const handlePageChange = (action: 'first' | 'prev' | 'next' | 'last') => {
    if (action === 'first') {
      setCursor(undefined);
      setDirection(undefined);
      setCurrentPage(1);
    } else if (action === 'prev' && hasPreviousPage) {
      setCursor(startCursor);
      setDirection('BACKWARD');
      setCurrentPage(Math.max(1, currentPage - 1));
    } else if (action === 'next' && hasNextPage) {
      setCursor(endCursor);
      setDirection('FORWARD');
      setCurrentPage(currentPage + 1);
    } else if (action === 'last') {
      const totalPages = Math.ceil(totalCount / perPage);
      setCurrentPage(totalPages);
    }
  };

  const { removePost } = usePostMutations({ websiteId });

  // Fetch custom post types for filter
  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });
  const customTypes = customTypesData?.cmsCustomPostTypes || [];

  if (loading) {
    return (
      <CmsLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-600">{t('Loading posts...')}</p>
        </div>
      </CmsLayout>
    );
  }

  if (error) {
    return (
      <CmsLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {t('Error loading posts')}
                </h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetchPosts()}
                >
                  {t('Try again')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CmsLayout>
    );
  }

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    checkboxColumn,
    {
      id: 'title',
      header: () => (
        <RecordTable.InlineHead label={t('Post Name')} icon={IconFile} />
      ),
      accessorKey: 'title',
      cell: ({ cell, row }) => (
        <div
          className="mx-2 my-1 p-1 flex items-center rounded-sm px-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium h-6 text-xs border gap-1 bg-accent overflow-hidden"
          onClick={() =>
            navigate(`/content/cms/${websiteId}/posts/add`, {
              state: { post: row.original },
            })
          }
          title={cell.getValue() as string}
        >
          <span className="text-sm font-medium truncate">
            {cell.getValue() as string}
          </span>
        </div>
      ),
      size: 300,
    },

    {
      id: 'excerpt',
      header: () => (
        <RecordTable.InlineHead label={t('Description')} icon={IconFile} />
      ),
      accessorKey: 'excerpt',
      cell: ({ row }) => {
        const excerpt = row.original.excerpt || t('No Description');
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium h-6 text-xs border gap-1 bg-accent max-w-[280px]">
            <span className="text-sm font-medium truncate" title={excerpt}>
              {excerpt}
            </span>
          </div>
        );
      },
      size: 300,
    },
    // {
    //   id: 'categories',
    //   header: () => <RecordTable.InlineHead label="Category" icon={IconList} />,
    //   accessorKey: 'categories',
    //   cell: ({ row }) => {
    //     const cats = (row.original.categories || []) as any[];
    //     return (
    //       <InlineCategoriesEditor
    //         postId={row.original._id}
    //         websiteId={websiteId}
    //         initialCategories={cats}
    //       />
    //     );
    //   },
    //   size: 260,
    // },
    // {
    //   id: 'tags',
    //   header: () => <RecordTable.InlineHead label="Tags" icon={IconList} />,
    //   accessorKey: 'tags',
    //   cell: ({ row }) => {
    //     const tags = (row.original.tags || []) as any[];
    //     return (
    //       <InlineTagsEditor
    //         postId={row.original._id}
    //         websiteId={websiteId}
    //         initialTags={tags}
    //       />
    //     );
    //   },
    //   size: 240,
    // },
    {
      id: 'scheduledDate',
      header: () => (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort('scheduledDate')}
        >
          <RecordTable.InlineHead
            label={t('publishDate')}
            icon={IconCalendarEvent}
          />
        </div>
      ),
      accessorFn: (row: any) => row.scheduledDate || row.createdAt,
      cell: ({ row }) => {
        const date = row.original.scheduledDate;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1">
            <IconCalendarEvent className="h-3 w-3" />
            {date
              ? new Date(date).toLocaleDateString('mn-MN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Publish date not selected'}
          </div>
        );
      },
      size: 180,
    },
    {
      id: 'createdAt',
      header: () => (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort('createdAt')}
        >
          <RecordTable.InlineHead
            label={t('Created At')}
            icon={IconCalendarPlus}
          />
        </div>
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 ">
          <IconCalendarPlus className="h-3 w-3" />
          {new Date(cell.getValue() as string).toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
      size: 180,
    },
    {
      id: 'updatedAt',
      header: () => (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort('updatedAt')}
        >
          <RecordTable.InlineHead
            label={t('Updated At')}
            icon={IconCalendarUp}
          />
        </div>
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1">
          <IconCalendarUp className="h-3 w-3" />
          {new Date(cell.getValue() as string).toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
      size: 180,
    },
    {
      id: 'actions',
      header: () => (
        <RecordTable.InlineHead label={t('Actions')} icon={IconDots} />
      ),
      cell: ({ row }) => (
        <div className="flex px-2 items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              navigate(`/content/cms/${websiteId}/posts/add`, {
                state: { post: row.original },
              })
            }
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive bg-destructive/10 hover:bg-destructive/20"
            onClick={() =>
              confirm({ message: 'Delete this post?' })
                .then(async () => {
                  try {
                    await removePost(row.original._id);
                    await refetchPosts();
                    toast({
                      title: 'Success',
                      description: 'Post deleted successfully',
                      variant: 'success',
                    });
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error?.message || 'Error deleting post',
                      variant: 'destructive',
                    });
                  }
                })
                .catch(() => {})
            }
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 120,
    },
  ];

  return (
    <CmsLayout>
      <div className="border rounded-lg mb-4">
        <div className="p-2 flex items-center gap-3 flex-wrap">
          {/* Custom Type Filter */}
          {/* <CustomTypeFilterButton
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            customTypes={customTypes}
          /> */}
          {/* Categories */}
          <CategoriesFilterButton
            categoryFilters={categoryFilters}
            onCategoriesChange={setCategoryFilters}
            websiteId={websiteId}
          />
          {/* Tags */}
          <TagsFilterButton
            tagFilters={tagFilters}
            onTagsChange={setTagFilters}
            websiteId={websiteId}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTypeFilter(undefined);
              setCategoryFilters([]);
              setTagFilters([]);
              setCursor(undefined);
              setDirection(undefined);
              setSortField('scheduledDate');
              setSortDirection('desc');
              setCurrentPage(1);
            }}
            className="ml-auto"
          >
            Clear filter
          </Button>
        </div>
      </div>

      {!loading && (sortedPosts || []).length === 0 ? (
        <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
          <div className="p-12">
            <EmptyState
              icon={IconFile}
              title={t('No posts yet')}
              description={t('Get started by creating your first post.')}
              actionLabel={t('Create post')}
              onAction={() => navigate(`/content/cms/${websiteId}/posts/add`)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="overflow-hidden">
            <RecordTable.Provider
              columns={columns}
              data={sortedPosts}
              className="h-full"
              stickyColumns={['more', 'checkbox', 'title']}
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>

              {/* Bulk actions command bar */}
              <PostsCommandBar
                onBulkDelete={async (ids: string[]) => {
                  await confirm({
                    message: `Delete ${ids.length} selected posts?`,
                  });
                  const results = await Promise.allSettled(
                    ids.map((id) => removePost(id)),
                  );
                  await refetchPosts();
                  const failed = results.filter((r) => r.status === 'rejected');
                  if (failed.length) {
                    throw new Error(
                      `Failed to delete ${failed.length}/${ids.length} posts`,
                    );
                  }
                }}
              />
            </RecordTable.Provider>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-background">
            <div className="text-sm text-muted-foreground">
              {t('Showing')} {(currentPage - 1) * perPage + 1} {t('to')}{' '}
              {Math.min(currentPage * perPage, totalCount)} {t('of')}{' '}
              {totalCount} {t('results')}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange('prev')}
                disabled={!hasPreviousPage || currentPage === 1 || loading}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>

              <PaginationPageNumbers
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / perPage)}
                onPageChange={(page) => {
                  // Cursor pagination only supports sequential navigation
                  // Direct page jumping is disabled
                  if (page === 1) {
                    setCurrentPage(1);
                    setCursor(undefined);
                    setDirection(undefined);
                  }
                }}
              />

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange('next')}
                disabled={
                  !hasNextPage ||
                  currentPage === Math.ceil(totalCount / perPage) ||
                  loading
                }
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </CmsLayout>
  );
}

const InlineTagsEditor = ({
  postId,
  websiteId,
  initialTags,
}: {
  postId: string;
  websiteId?: string;
  initialTags: Array<{ _id: string; name: string }>;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (initialTags || []).map((t) => t._id),
  );
  const [localTags, setLocalTags] = useState(initialTags || []);

  const { tags, loading } = useTags({
    clientPortalId: websiteId || '',
    limit: 100,
  });

  const options = useMemo(
    () => (tags || []).map((t: any) => ({ label: t.name, value: t._id })),
    [tags],
  );

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.includes(o.value)),
    [options, selectedIds],
  );

  const [editPost, { loading: saving }] = useMutation(CMS_POSTS_EDIT, {
    update(cache, { data }) {
      cache.evict({ fieldName: 'cmsPostList' });
      cache.gc();
    },
    awaitRefetchQueries: true,
  });

  const handleChange = async (
    opts: Array<{ label: string; value: string }>,
  ) => {
    const newIds = opts.map((o) => o.value);
    setSelectedIds(newIds);
    setLocalTags(opts.map((o) => ({ _id: o.value, name: o.label })) as any);
    try {
      await editPost({ variables: { id: postId, input: { tagIds: newIds } } });
      toast({ title: 'Saved', description: 'Tags updated' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to update tags',
        variant: 'destructive',
      });
    }
  };

  return (
    <PopoverScoped scope={`cms.posts.${postId}.tags`}>
      <RecordTableInlineCell.Trigger className="mx-2 my-1">
        {localTags?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {localTags.map((t: any) => (
              <span
                key={t._id}
                className="inline-flex items-center h-6 px-2 rounded-md border text-xs bg-white text-gray-800"
              >
                {t.name}
              </span>
            ))}
            <span className="inline-flex items-center h-6 px-2 rounded-md border text-xs text-muted-foreground">
              +
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center h-6 px-2 rounded-md border text-xs text-muted-foreground">
              +
            </span>
            <span className="text-muted-foreground text-xs">No tags</span>
          </div>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <div className="w-[280px] p-2 space-y-2">
          <div className="text-xs font-medium text-gray-600">Edit Tags</div>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Spinner size="sm" /> Loading tags...
            </div>
          ) : (
            <MultipleSelector
              value={selectedOptions as any}
              options={options as any}
              placeholder="Select tags"
              onChange={handleChange as any}
              disabled={saving}
            />
          )}
        </div>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const InlineCategoriesEditor = ({
  postId,
  websiteId,
  initialCategories,
}: {
  postId: string;
  websiteId?: string;
  initialCategories: Array<{ _id: string; name: string }>;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (initialCategories || []).map((c) => c._id),
  );
  const [localCategories, setLocalCategories] = useState(
    initialCategories || [],
  );

  const { categories, loading } = useCategories({
    clientPortalId: websiteId || '',
    limit: 100,
  });

  const options = useMemo(
    () => (categories || []).map((c: any) => ({ label: c.name, value: c._id })),
    [categories],
  );

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.includes(o.value)),
    [options, selectedIds],
  );

  const [editPost, { loading: saving }] = useMutation(CMS_POSTS_EDIT);

  const handleChange = async (
    opts: Array<{ label: string; value: string }>,
  ) => {
    const newIds = opts.map((o) => o.value);
    setSelectedIds(newIds);
    setLocalCategories(
      opts.map((o) => ({ _id: o.value, name: o.label })) as any,
    );
    try {
      await editPost({
        variables: { id: postId, input: { categoryIds: newIds } },
      });
      toast({ title: 'Saved', description: 'Categories updated' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to update categories',
        variant: 'destructive',
      });
    }
  };

  return (
    <PopoverScoped scope={`cms.posts.${postId}.categories`}>
      <RecordTableInlineCell.Trigger className="mx-2 my-1">
        {localCategories?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {localCategories.map((c: any) => (
              <span
                key={c._id}
                className="inline-flex items-center h-6 px-2 rounded-md border text-xs bg-white text-gray-800"
              >
                {c.name}
              </span>
            ))}
            <span className="inline-flex items-center h-6 px-2 rounded-md border text-xs text-muted-foreground">
              +
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center h-6 px-2 rounded-md border text-xs text-muted-foreground">
              +
            </span>
            <span className="text-muted-foreground text-xs">No categories</span>
          </div>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <div className="w-[280px] p-2 space-y-2">
          <div className="text-xs font-medium text-gray-600">
            Edit Categories
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Spinner size="sm" /> Loading categories...
            </div>
          ) : (
            <MultipleSelector
              value={selectedOptions as any}
              options={options as any}
              placeholder="Select categories"
              onChange={handleChange as any}
              disabled={saving}
            />
          )}
        </div>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const CustomTypeFilterButton = ({
  typeFilter,
  onTypeChange,
  customTypes,
}: {
  typeFilter?: string;
  onTypeChange: (value: string | undefined) => void;
  customTypes: any[];
}) => {
  const selectedType = customTypes.find((t) => t._id === typeFilter);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconLayoutGrid className="mr-2 h-4 w-4" />
          Type: {selectedType ? selectedType.label : 'All'}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-64 p-2">
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="all" onSelect={() => onTypeChange(undefined)}>
              All Types
            </Command.Item>
            {customTypes.map((type: any) => (
              <Command.Item
                key={type._id}
                value={type._id}
                onSelect={() => onTypeChange(type._id)}
              >
                {type.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

const CategoriesFilterButton = ({
  categoryFilters,
  onCategoriesChange,
  websiteId,
}: {
  categoryFilters: string[];
  onCategoriesChange: (values: string[]) => void;
  websiteId?: string;
}) => {
  const { categories } = useCategories({
    clientPortalId: websiteId || '',
    limit: 100,
  });

  const categoryOptions = useMemo(
    () => (categories || []).map((c: any) => ({ label: c.name, value: c._id })),
    [categories],
  );

  const selectedCategories = useMemo(
    () => categoryOptions.filter((o) => categoryFilters.includes(o.value)),
    [categoryOptions, categoryFilters],
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconList className="mr-2 h-4 w-4" />
          Categories:{' '}
          {categoryFilters.length
            ? `${categoryFilters.length} selected`
            : 'All'}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80 p-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">
            Select Categories
          </div>
          <MultipleSelector
            value={selectedCategories as any}
            options={categoryOptions as any}
            placeholder="Select categories"
            onChange={(opts: any[]) =>
              onCategoriesChange(opts.map((o) => o.value))
            }
          />
        </div>
      </Popover.Content>
    </Popover>
  );
};

const TagsFilterButton = ({
  tagFilters,
  onTagsChange,
  websiteId,
}: {
  tagFilters: string[];
  onTagsChange: (values: string[]) => void;
  websiteId?: string;
}) => {
  const { tags } = useTags({
    clientPortalId: websiteId || '',
    type: 'cms',
    limit: 100,
  });

  const tagOptions = useMemo(
    () => (tags || []).map((t: any) => ({ label: t.name, value: t._id })),
    [tags],
  );

  const selectedTags = useMemo(
    () => tagOptions.filter((o) => tagFilters.includes(o.value)),
    [tagOptions, tagFilters],
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconList className="mr-2 h-4 w-4" />
          Tags: {tagFilters.length ? `${tagFilters.length} selected` : 'All'}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80 p-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">Select Tags</div>
          <MultipleSelector
            value={selectedTags as any}
            options={tagOptions as any}
            placeholder="Select tags"
            onChange={(opts: any[]) => onTagsChange(opts.map((o) => o.value))}
          />
        </div>
      </Popover.Content>
    </Popover>
  );
};

const PaginationPageNumbers = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {getPageNumbers().map((page, idx) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-8 text-center text-sm text-muted-foreground select-none"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8 text-xs"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ),
      )}
    </div>
  );
};

const PostsCommandBar = ({
  onBulkDelete,
}: {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row: any) => row.original._id as string,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          size="sm"
          onClick={() =>
            confirm({
              message: `Are you sure you want to delete the ${selectedIds.length} selected posts?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete posts',
                  variant: 'destructive',
                });
              }
            })
          }
        >
          <IconTrash className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
