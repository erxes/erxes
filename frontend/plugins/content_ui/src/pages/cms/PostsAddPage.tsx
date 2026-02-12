import { PageContainer } from 'erxes-ui';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { useState } from 'react';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { PostsHotKeyScope } from '~/modules/cms/posts/types/PostsHotKeyScope';
import { useEffect } from 'react';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';

export const PostsAddPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<any>(null);
  const { post, loading } = usePostDetail(postId);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(PostsHotKeyScope.PostsAddSheet);
  }, [setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <PageContainer>
      <PostsHeader>
        {formState && (
          <AddPostHeaderActions
            form={formState.form}
            onSubmit={() => formState.form.handleSubmit(formState.onSubmit)()}
            creating={formState.creating}
            saving={formState.saving}
          />
        )}
      </PostsHeader>
      <div className="w-full h-full">
        {clientPortalId && !loading && (
          <AddPostForm
            websiteId={clientPortalId}
            editingPost={post}
            onClose={onClose}
            onFormReady={setFormState}
          />
        )}
      </div>
    </PageContainer>
  );
};
