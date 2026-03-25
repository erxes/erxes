import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';
import { useNavigate, useParams } from 'react-router';
import { CmsSidebar } from '~/modules/cms/shared/CmsSidebar';
import { HeaderLanguageTabs } from '~/modules/cms/shared/HeaderLanguageTabs';
import { Posts } from '~/modules/cms/posts/types/postsType';

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
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleEditPost = (post: Posts) => {
    navigate(`/content/cms/${websiteId}/posts/detail/${post._id}`);
  };

  return (
    <PageContainer>
      <PostsHeader>
        <HeaderLanguageTabs />
        <PostsAdd clientPortalId={clientPortalId} />
      </PostsHeader>

      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />

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
