import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { PostsSidebar } from '~/modules/cms/posts/components/PostsSidebar';
import { useNavigate } from 'react-router-dom';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';

export const PostsIndexPage = ({
  clientPortalId,
}: {
  clientPortalId: string;
}) => {
  const navigate = useNavigate();

  const handleEditPost = (post: any) => {
    navigate(`/content/cms/${clientPortalId}/posts/detail/${post._id}`);
  };

  return (
    <PageContainer>
      <PostsHeader>
        <PostsAdd clientPortalId={clientPortalId} />
      </PostsHeader>
      <div className="flex overflow-hidden flex-auto">
        <PostsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <PostsPageContent
            clientPortalId={clientPortalId}
            onEditPost={handleEditPost}
          />
        </div>
      </div>
    </PageContainer>
  );
};
const PostsPageContent = ({
  clientPortalId,
  onEditPost,
}: {
  clientPortalId: string;
  onEditPost: (post: any) => void;
}) => {
  return (
    <div className="overflow-hidden flex-auto">
      <div className="h-full">
        <PageSubHeader>
          <PostsFilter clientPortalId={clientPortalId}/>
        </PageSubHeader>
        <PostsRecordTable
          clientPortalId={clientPortalId}
          onEditPost={onEditPost}
        />
      </div>
    </div>
  );
};
