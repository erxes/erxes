import { useMutation } from '@apollo/client';
import {
  CMS_POSTS_REMOVE,
  CMS_POSTS_REMOVE_MANY,
} from '../graphql/mutations/postsRemoveMutations';

export const useRemovePosts = () => {
  const [_removePosts, { loading }] = useMutation(CMS_POSTS_REMOVE);
  const [_removePostsMany, { loading: loadingMany }] = useMutation(
    CMS_POSTS_REMOVE_MANY,
  );

  const removePost = async (postsId: string) => {
    await _removePosts({ variables: { id: postsId } });
  };

  const removeManyPosts = async (postsIds: string[]) => {
    await _removePostsMany({ variables: { _ids: postsIds } });
  };

  return {
    removePosts: removePost,
    removeManyPosts,
    loading: loading || loadingMany,
  };
};
