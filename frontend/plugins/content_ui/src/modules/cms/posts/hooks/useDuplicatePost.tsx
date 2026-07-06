import { useMutation } from '@apollo/client';
import { CMS_POSTS_DUPLICATE } from '../graphql/mutations/postsDuplicateMutation';

export const useDuplicatePost = () => {
  const [_duplicatePost, { loading }] = useMutation(CMS_POSTS_DUPLICATE, {
    refetchQueries: ['CmsPostList'],
    awaitRefetchQueries: true,
  });

  const duplicatePost = async (postId: string) => {
    const { data } = await _duplicatePost({ variables: { _id: postId } });

    return data?.cmsPostsDuplicate;
  };

  return { duplicatePost, loading };
};
