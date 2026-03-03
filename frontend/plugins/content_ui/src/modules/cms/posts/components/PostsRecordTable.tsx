import { RecordTable, Spinner } from 'erxes-ui';
import { usePostsColumns } from './PostsColumn';
import { PostsCommandbar } from './posts-command-bar/PostsCommandbar';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';
import { usePosts } from '../hooks/usePosts';
import { PostsAdd } from './PostsAdd';
import { IconShoppingCartX } from '@tabler/icons-react';

interface PostsRecordTableProps {
  clientPortalId: string;
  onEditPost?: (post: any) => void;
}

export const PostsRecordTable = ({
  clientPortalId,
  onEditPost,
}: PostsRecordTableProps) => {
  const { posts, loading, refetch, pageInfo, handleFetchMore } = usePosts({
    variables: {
      clientPortalId,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = usePostsColumns(onEditPost, refetch);
  if (loading) return <Spinner />;
  return (
    <RecordTable.Provider
      columns={columns}
      data={posts || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={posts?.length}
        sessionKey={POSTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && posts?.length === 0 && (
          <div>
            <div className="flex justify-center px-8 w-full h-full">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="mx-auto mb-4 text-muted-foreground"
                  />
                  <h3 className="mb-2 text-xl font-semibold">No post yet</h3>
                  <p className="max-w-md text-muted-foreground">
                    Get started by creating your first post.
                  </p>
                </div>
                <PostsAdd clientPortalId={clientPortalId} />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <PostsCommandbar refetch={refetch} />
    </RecordTable.Provider>
  );
};
