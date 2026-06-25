import { PageContainer } from 'erxes-ui';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import type { PostFormReadyState } from '~/modules/cms/posts/types';
import { useState, useCallback, useRef } from 'react';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  buildPostsListPath,
  getPostsReturnPath,
} from '~/modules/cms/posts/utils/postsNavigation';

export const PostsAddPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<PostFormReadyState | null>(null);
  const { post, loading } = usePostDetail(postId || '');
  const navigate = useNavigate();
  const location = useLocation();
  const { websiteId } = useParams();

  const languageChangeRef = useRef<(lang: string) => void>();

  const handleFormReady = useCallback((state: PostFormReadyState) => {
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
