import { useMutation } from '@apollo/client';
import {
  POSTS_ADD,
  CMS_POSTS_EDIT,
  CMS_POSTS_REMOVE,
} from '../graphql/queries';

interface PostInput {
  [key: string]: any;
}

interface UsePostMutationsOptions {
  websiteId?: string;
}

export function usePostMutations({ websiteId }: UsePostMutationsOptions = {}) {
  const [createPostMutation, createState] = useMutation(POSTS_ADD, {
    update(cache) {
      cache.evict({ fieldName: 'cmsPostList' });
      cache.gc();
    },
    awaitRefetchQueries: true,
  });

  const [editPostMutation, editState] = useMutation(CMS_POSTS_EDIT, {
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

  const [removePostMutation, removeState] = useMutation(CMS_POSTS_REMOVE);

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
