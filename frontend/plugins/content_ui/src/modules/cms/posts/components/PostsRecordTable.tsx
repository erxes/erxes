import { RecordTable, Spinner } from 'erxes-ui';
import { usePostsColumns } from './PostsColumn';
import { PostsCommandbar } from './posts-command-bar/PostsCommandbar';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';
import { usePosts } from '../hooks/usePosts';
import { Posts } from '../types/postsType';

interface PostsRecordTableProps {
  clientPortalId: string;
  onEditPost?: (post: Posts) => void;
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
      </RecordTable.CursorProvider>
      <PostsCommandbar refetch={refetch} />
    </RecordTable.Provider>
  );
};
