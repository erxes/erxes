import { useMutation } from '@apollo/client';
import {
  CMS_POSTS_ADD,
  CMS_POSTS_EDIT,
  CMS_POSTS_REMOVE,
} from '@/cms/posts/graphql';
import type { PostEditVariables, PostInput } from '@/cms/posts/types';

interface PostMutationResult {
  _id: string;
}

interface CreatePostMutationResponse {
  cmsPostsAdd?: PostMutationResult | null;
}

interface EditPostMutationResponse {
  cmsPostsEdit?: PostMutationResult | null;
}

interface CreatePostMutationVariables {
  input: PostInput;
}

interface RemovePostMutationVariables {
  id: string;
}

export function usePostMutations() {
  const [createPostMutation, createState] = useMutation<
    CreatePostMutationResponse,
    CreatePostMutationVariables
  >(CMS_POSTS_ADD, {
    update(cache) {
      cache.evict({ fieldName: 'cmsPostList' });
      cache.gc();
    },
    awaitRefetchQueries: true,
  });

  const [editPostMutation, editState] = useMutation<
    EditPostMutationResponse,
    PostEditVariables
  >(CMS_POSTS_EDIT, {
    refetchQueries: 'all',
    awaitRefetchQueries: true,
    update(cache, { data }) {
      if (data?.cmsPostsEdit?._id) {
        cache.evict({
          id: cache.identify({
            __typename: 'Post',
            _id: data.cmsPostsEdit._id,
          }),
        });
        cache.gc();
      }
    },
  });

  const [removePostMutation, removeState] = useMutation<
    { cmsPostsRemove?: unknown },
    RemovePostMutationVariables
  >(CMS_POSTS_REMOVE);

  const createPost = (input: PostInput) =>
    createPostMutation({ variables: { input } });

  const editPost = (id: string, input: PostInput) =>
    editPostMutation({ variables: { id, input } });

  const removePost = (id: string) => removePostMutation({ variables: { id } });

  return {
    createPost,
    editPost,
    removePost,
    creating: createState.loading,
    saving: editState.loading,
    removing: removeState.loading,
  };
}
