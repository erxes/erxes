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
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import { usePosts } from '../../hooks/usePosts';
import { useMutation } from '@apollo/client';
import { CMS_POSTS_EDIT, CMS_POSTS_REMOVE } from '../../graphql/queries';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useTags } from '../../hooks/useTags';

export function Posts() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const {
    posts,
    loading,
    error,
    totalCount,
    refetch: refetchPosts,
  } = usePosts({
    clientPortalId: websiteId || '',
    type: 'post',
    perPage: 20,
    page: 1,
  });

  const [removePost] = useMutation(CMS_POSTS_REMOVE, {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
        variant: 'success',
      });
      refetchPosts();
      setSelectedRowKeys([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error deleting post: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  if (loading) {
    return (
      <CmsLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      </CmsLayout>
    );
  }

  if (error) {
    return (
      <CmsLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            Error loading posts: {error.message}
          </div>
        </div>
      </CmsLayout>
    );
  }

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => (
        <Popover>
          <Popover.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full" />
          </Popover.Trigger>
          <Combobox.Content>
            <Command shouldFilter={false}>
              <Command.List>
                <Command.Item
                  value="edit"
                  onSelect={() =>
                    navigate(`/content/cms/${websiteId}/posts/add`, {
                      state: { post: row.original },
                    })
                  }
                >
                  <IconEdit /> Edit
                </Command.Item>
                <Command.Item
                  value="remove"
                  onSelect={() =>
                    confirm({ message: 'Delete this post?' })
                      .then(async () => {
                        await removePost({
                          variables: { id: row.original._id },
                        });
                        await refetchPosts();
                        toast({ title: 'Success', variant: 'default' });
                      })
                      .catch(() => {})
                  }
                >
                  <IconTrash /> Delete
                </Command.Item>
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      ),
      size: 40,
    },
    checkboxColumn,
    {
      id: 'title',
      header: () => (
        <RecordTable.InlineHead label="Post Name" icon={IconFile} />
      ),
      accessorKey: 'title',
      cell: ({ cell, row }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm font-medium text-gray-900">
            {cell.getValue() as string}
          </span>
        </div>
      ),
      size: 300,
    },
    {
      id: 'categories',
      header: () => <RecordTable.InlineHead label="Category" icon={IconList} />,
      accessorKey: 'categories',
      cell: ({ row }) => {
        const cats = (row.original.categories || []) as any[];
        if (!cats.length) return null;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            {cats.map((c: any) => (
              <span
                key={c._id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {c.name}
              </span>
            ))}
          </div>
        );
      },
      size: 260,
    },
    {
      id: 'tags',
      header: () => <RecordTable.InlineHead label="Tags" icon={IconList} />,
      accessorKey: 'tags',
      cell: ({ row }) => {
        const tags = (row.original.tags || []) as any[];
        return (
          <InlineTagsEditor
            postId={row.original._id}
            websiteId={websiteId}
            initialTags={tags}
          />
        );
      },
      size: 240,
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead label="Created Date" icon={IconList} />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          {new Date(cell.getValue() as string).toLocaleDateString('en-US', {
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
        <RecordTable.InlineHead label="Modified Date" icon={IconList} />
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          {new Date(cell.getValue() as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
      size: 180,
    },
  ];

  return (
    <CmsLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">Found {totalCount} posts</div>
      </div>

      {!loading && (posts || []).length === 0 ? (
        <div className="bg-white rounded-lg overflow-hidden">
          <EmptyState
            icon={IconFile}
            title="No posts yet"
            description="Get started by creating your first post."
            actionLabel="Create post"
            onAction={() => navigate(`/content/cms/${websiteId}/posts/add`)}
          />
        </div>
      ) : (
        <div className="bg-white h-full rounded-lg shadow-sm border overflow-hidden">
          <RecordTable.Provider
            columns={columns}
            data={posts}
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
                  ids.map((id) => removePost({ variables: { id } })),
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

  const [editPost, { loading: saving }] = useMutation(CMS_POSTS_EDIT);

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
