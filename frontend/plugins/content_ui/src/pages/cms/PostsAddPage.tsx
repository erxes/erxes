import { PageContainer } from 'erxes-ui';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import {
  AddPostHeaderActions,
  type PostFormData,
} from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { useState, useCallback, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  buildPostsListPath,
  getPostsReturnPath,
} from '~/modules/cms/posts/utils/postsNavigation';

interface PostHeaderFormState {
  form: UseFormReturn<PostFormData>;
  onSubmit: (data?: PostFormData) => void | Promise<void>;
  creating: boolean;
  saving: boolean;
  handleLanguageChange: (lang: string) => void;
}

export const PostsAddPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<PostHeaderFormState | null>(null);
  const { post, loading } = usePostDetail(postId || '');
  const navigate = useNavigate();
  const location = useLocation();
  const { websiteId } = useParams();

  const languageChangeRef = useRef<(lang: string) => void>();

  const handleFormReady = useCallback((state: PostHeaderFormState) => {
    setFormState(state);
    languageChangeRef.current = state.handleLanguageChange;
  }, []);

  const handleHeaderLanguageChange = useCallback((lang: string) => {
    if (languageChangeRef.current) {
      languageChangeRef.current(lang);
    }
  }, []);

  const handleClose = useCallback(() => {
    const returnTo = getPostsReturnPath(location.state, postId);

    navigate(
      returnTo ||
        buildPostsListPath({
          websiteId,
          search: location.search,
          postId,
        }),
    );
  }, [location.search, location.state, navigate, postId, websiteId]);

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
