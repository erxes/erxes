import { PageContainer, Spinner } from 'erxes-ui';
import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import type { PostFormReadyState } from '~/modules/cms/posts/types';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { usePostDetail } from '~/modules/cms/posts/hooks/usePostDetail';
import {
  buildPostsListPath,
  getPostsReturnPath,
} from '~/modules/cms/posts/utils/postsNavigation';

export const PostsDetailPage = ({
  clientPortalId,
  postId,
}: {
  clientPortalId: string;
  postId?: string;
}) => {
  const [formState, setFormState] = useState<PostFormReadyState | null>(null);
  const { post, loading } = usePostDetail(postId ?? '');
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
          postType: post?.type,
          postId,
        }),
    );
  }, [
    location.search,
    location.state,
    navigate,
    post?.type,
    postId,
    websiteId,
  ]);

  return (
    <PageContainer key={postId}>
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
