import { useQuery } from '@apollo/client';
import { RecordTable, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { usePostsColumns } from './PostsColumn';
import { PostsCommandbar } from './posts-command-bar/PostsCommandbar';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';
import { usePosts } from '../hooks/usePosts';
import { PostsEmptyState } from './PostsEmptyState';
import { Posts } from '../types/postsType';
import { CONTENT_CMS_LIST } from '../../graphql/queries';
import type { IWebsite } from '../../types';

interface PostsRecordTableProps {
  clientPortalId: string;
  onEditPost?: (post: Posts) => void;
}

export const PostsRecordTable = ({
  clientPortalId,
  onEditPost,
}: PostsRecordTableProps) => {
  const { data: cmsData } = useQuery<{ contentCMSList?: IWebsite[] }>(
    CONTENT_CMS_LIST,
    {
      fetchPolicy: 'cache-first',
      skip: !clientPortalId,
    },
  );
  const { posts, loading, refetch, pageInfo, handleFetchMore } = usePosts({
    variables: {
      clientPortalId,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const cmsConfig = useMemo(
    () =>
      cmsData?.contentCMSList?.find(
        (cms) => cms.clientPortalId === clientPortalId,
      ),
    [clientPortalId, cmsData?.contentCMSList],
  );
  const columns = usePostsColumns(onEditPost, refetch, cmsConfig);

  if (loading && (!posts || posts.length === 0)) return <Spinner />;

  if (!loading && (!posts || posts.length === 0)) {
    return <PostsEmptyState clientPortalId={clientPortalId} />;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={posts || []}
      className="h-full"
      stickyColumns={['openPublicUrl', 'more', 'checkbox', 'title']}
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
