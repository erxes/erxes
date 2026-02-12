import { OperationVariables, useMutation } from '@apollo/client';
import { CMS_POSTS_REMOVE } from '../graphql/mutations/postsRemoveMutations';
import { POSTS_LIST } from '../graphql/queries/postsListQueries';

interface PostListData {
  cmsPostsList: {
    posts: Array<{ _id: string }>;
    totalCount: number;
  };
}

export const useRemovePosts = () => {
  const [_removePosts, { loading }] = useMutation(CMS_POSTS_REMOVE);

  const removePost = async (postsId: string, options?: OperationVariables) => {
    await _removePosts({
      ...options,
      variables: { id: postsId, ...options?.variables },
      update: (cache) => {
        try {
          const existingData = cache.readQuery<PostListData>({
            query: POSTS_LIST,
            variables: options?.variables,
          });

          if (!existingData?.cmsPostsList) {
            return;
          }

          const updatedPosts = existingData.cmsPostsList.posts.filter(
            (post: PostListData['cmsPostsList']['posts'][number]) =>
              post._id !== postsId,
          );

          cache.writeQuery<PostListData>({
            query: POSTS_LIST,
            variables: options?.variables,
            data: {
              cmsPostsList: {
                ...existingData.cmsPostsList,
                posts: updatedPosts,
                totalCount: existingData.cmsPostsList.totalCount - 1,
              },
            },
          });
        } catch (error) {
          console.error('Cache update error:', error);
        }
      },
    });
  };

  return { removePosts: removePost, loading };
};
