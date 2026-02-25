import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, toast } from 'erxes-ui';
import { IconFile, IconList } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';

import { PostActions } from './PostActions';
import { InlineTagsEditor } from './InlineTagsEditor';
import { dateColumn } from './DateCell';
import { CMS_POSTS_REMOVE } from '../../graphql/queries';

type PostsTableProps = {
  posts: any[];
  loading: boolean;
  totalCount: number;
  refetch: () => void;
};

export function PostsTable({
  posts,
  loading,
  totalCount,
  refetch,
}: PostsTableProps) {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const [removePost] = useMutation(CMS_POSTS_REMOVE, {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
        variant: 'default',
      });
      refetch();
      setSelectedRowKeys([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error deleting post: ${error.message}`,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const handleDeletePost = async (postId: string) => {
    await removePost({ variables: { id: postId } });
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'more',
        header: () => <span className="sr-only">More</span>,
        cell: ({ row }) => (
          <PostActions
            post={row.original}
            onDelete={() => handleDeletePost(row.original._id)}
          />
        ),
        size: 40,
      },

      RecordTable.checkboxColumn as ColumnDef<any>,
      {
        id: 'title',
        header: () => (
          <RecordTable.InlineHead label="Post Name" icon={IconFile} />
        ),
        accessorKey: 'title',
        cell: ({ cell }) => (
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
        header: () => (
          <RecordTable.InlineHead label="Category" icon={IconList} />
        ),
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
        cell: ({ row }) => (
          <InlineTagsEditor
            postId={row.original._id}
            websiteId={websiteId}
            initialTags={row.original.tags || []}
          />
        ),
        size: 240,
      },
      dateColumn('Created Date', 'createdAt'),
      dateColumn('Modified Date', 'updatedAt'),
    ],
    [websiteId],
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <IconFile className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No posts yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by creating your first post.
          </p>
          <button
            onClick={() => navigate(`/content/cms/${websiteId}/posts/add`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create post
          </button>
        </div>
      </div>
    );
  }

  return (
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
      </RecordTable.Provider>
    </div>
  );
}
