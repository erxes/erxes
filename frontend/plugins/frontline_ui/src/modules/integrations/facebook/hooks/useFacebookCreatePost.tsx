import { useMutation } from '@apollo/client';
import { FACEBOOK_CREATE_POST } from '../graphql/mutations/fbPost';

export const useFacebookCreatePost = () => {
  const [createPost, { loading }] = useMutation(FACEBOOK_CREATE_POST);

  return { createPost, loading };
};
