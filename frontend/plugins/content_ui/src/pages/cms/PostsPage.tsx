import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';
import { Posts } from '~/modules/cms/posts/types/postsType';
import { CMS_POST_CONTENT_TYPE } from '~/modules/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '~/modules/cms/shared/side-panel/useContentPanel';

interface PostsPageContentProps {
  clientPortalId: string;
  handleEditPost: (post: Posts) => void;
}

const PostsPageContent = ({
  clientPortalId,
  handleEditPost,
}: PostsPageContentProps) => {
  return (
    <>
      <PageSubHeader>
        <PostsFilter clientPortalId={clientPortalId} />
      </PageSubHeader>

      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <PostsRecordTable
            clientPortalId={clientPortalId}
            onEditPost={handleEditPost}
          />
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
  const { openDetail } = useContentPanel(CMS_POST_CONTENT_TYPE);

  const handleEditPost = (post: Posts) => {
    openDetail(post._id);
  };

  return (
    <PageContainer className="flex-row">
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <PostsHeader>
          <PostsAdd clientPortalId={clientPortalId} />
        </PostsHeader>
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <PostsPageContent
            clientPortalId={clientPortalId}
            handleEditPost={handleEditPost}
          />
        </div>
      </div>
    </PageContainer>
  );
};
