import { PageContainer } from 'erxes-ui';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { useState, useCallback, useRef } from 'react';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import { useNavigate, useParams } from 'react-router-dom';

export const PostsAddPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<any>(null);
  const { post, loading } = usePostDetail(postId || '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const languageChangeRef = useRef<(lang: string) => void>();

  const handleFormReady = useCallback((formState: any) => {
    setFormState(formState);
    languageChangeRef.current = formState.handleLanguageChange;
  }, []);

  const handleHeaderLanguageChange = useCallback((lang: string) => {
    if (languageChangeRef.current) {
      languageChangeRef.current(lang);
    }
  }, []);

  const handleClose = useCallback(() => {
    const typeCode = new URLSearchParams(window.location.search).get('type');
    const typeParam =
      typeCode && typeCode !== 'post' ? `?type=${typeCode}` : '';
    navigate(`/content/cms/${websiteId}/posts${typeParam}`);
  }, [navigate, websiteId]);

  return (
    <PageContainer>
      <PostsHeader onLanguageChange={handleHeaderLanguageChange}>
        {formState && (
          <AddPostHeaderActions
            form={formState.form}
            onSubmit={formState.onSubmit}
            creating={formState.creating}
            saving={formState.saving}
          />
        )}
      </PostsHeader>
      <div className="flex flex-col overflow-hidden w-full h-full">
        {clientPortalId && !loading && (
          <AddPostForm
            websiteId={clientPortalId}
            editingPost={post}
            onFormReady={handleFormReady}
            onClose={handleClose}
          />
        )}
      </div>
    </PageContainer>
  );
};
