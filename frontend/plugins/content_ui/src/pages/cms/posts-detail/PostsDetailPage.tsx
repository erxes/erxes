import { PageContainer } from 'erxes-ui';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import { useState, useEffect } from 'react';

export const PostsDetailPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const { post } = usePostDetail(postId);
  const [formState, setFormState] = useState<{
    form: any;
    onSubmit: (data?: any) => Promise<void>;
    creating: boolean;
    saving: boolean;
  } | null>(null);

  useEffect(() => {
    if (!postId) {
      setFormState(null);
    }
  }, [postId]);

  return (
    <PageContainer key={postId}>
      <div>
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
        <AddPostForm
          websiteId={clientPortalId}
          editingPost={post}
          onFormReady={setFormState}
          key={postId}
        />
      </div>
    </PageContainer>
  );
};
