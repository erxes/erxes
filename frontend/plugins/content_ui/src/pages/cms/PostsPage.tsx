import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { CmsSidebar } from '~/modules/cms/shared/CmsSidebar';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';
import { useNavigate, useParams } from 'react-router';

export const PostsIndexPage = ({
  clientPortalId,
}: {
  clientPortalId: string;
}) => {
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleEditPost = (post: any) => {
    navigate(`/content/cms/${websiteId}/posts/detail/${post._id}`);
  };

  return (
    <PageContainer>
      <PostsHeader>
        <PostsAdd clientPortalId={clientPortalId} />
      </PostsHeader>
      <div className="flex h-full">
        <CmsSidebar />
        <div className="flex flex-col w-full">
          <PageSubHeader>
            <PostsFilter clientPortalId={clientPortalId} />
          </PageSubHeader>
          <PostsRecordTable
            clientPortalId={clientPortalId}
            onEditPost={handleEditPost}
          />
        </div>
      </div>
    </PageContainer>
  );
};
