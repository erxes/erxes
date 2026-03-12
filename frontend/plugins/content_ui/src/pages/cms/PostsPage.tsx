import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';
import { useNavigate, useParams } from 'react-router';
import { CmsSidebar } from '~/modules/cms/shared/CmsSidebar';
import { Posts } from '~/modules/cms/posts/types/postsType';
import { usePosts } from '~/modules/cms/posts/hooks/usePosts';
import { EmptyState } from '~/modules/cms/shared/EmptyState';
import { IconArticle } from '@tabler/icons-react';

/**
 * Props for the PostsIndexPageContent component
 */
interface PostsIndexPageContentProps {
  clientPortalId: string;
  handleEditPost: (post: Posts) => void;
}

/**
 * Content component for the posts index page
 * Contains the filter and posts table
 */
const PostsIndexPageContent = ({
  clientPortalId,
  handleEditPost,
}: PostsIndexPageContentProps) => {
  const { posts, loading, totalCount } = usePosts({
    variables: {
      clientPortalId,
    },
  });

  return (
    <>
      <PageSubHeader>
        <PostsFilter clientPortalId={clientPortalId} />
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="flex-auto">
          <div className="flex flex-col">
            <div className="flex pt-2 pl-4 justify-between items-center mb-2"></div>
            {!loading && (!posts || posts.length === 0) ? (
              <div className="rounded-lg overflow-hidden">
                <EmptyState
                  icon={IconArticle}
                  title="No posts yet"
                  description="Get started by creating your first post."
                  actionLabel="Add post"
                  onAction={() => {}}
                />
              </div>
            ) : (
              <div className="h-full">
                <PostsRecordTable
                  clientPortalId={clientPortalId}
                  onEditPost={handleEditPost}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const PostsIndexPage = ({
  clientPortalId,
}: {
  clientPortalId: string;
}) => {
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleEditPost = (post: Posts) => {
    navigate(`/content/cms/${websiteId}/posts/detail/${post._id}`);
  };

  return (
    <PageContainer>
      <PostsHeader>
        <PostsAdd clientPortalId={clientPortalId} />
      </PostsHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <PostsIndexPageContent
            clientPortalId={clientPortalId}
            handleEditPost={handleEditPost}
          />
        </div>
      </div>
    </PageContainer>
  );
};
