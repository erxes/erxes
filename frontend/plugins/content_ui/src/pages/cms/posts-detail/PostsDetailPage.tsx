import { PageContainer } from 'erxes-ui';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { useState, useCallback } from 'react';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'erxes-ui';

export const PostsDetailPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<any>(null);
  const { post, loading } = usePostDetail(postId ?? '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleFormReady = useCallback((state: any) => {
    setFormState(state);
  }, []);

  const handleClose = useCallback(() => {
    navigate(`/content/cms/${websiteId}/posts`);
  }, [navigate, websiteId]);

  return (
    <PageContainer key={postId}>
      <PostsHeader>
        {formState && (
          <AddPostHeaderActions
            form={formState.form}
            onSubmit={formState.onSubmit}
            creating={formState.creating}
            saving={formState.saving}
          />
        )}
      </PostsHeader>
      <div className="w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          clientPortalId && (
            <AddPostForm
              websiteId={clientPortalId}
              editingPost={post}
              onFormReady={handleFormReady}
              onClose={handleClose}
            />
          )
        )}
      </div>
    </PageContainer>
  );
};
