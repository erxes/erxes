import { useMutation } from '@apollo/client';
import { FACEBOOK_CREATE_POST } from '../graphql/mutations/fbPost';

export interface IFacebookCreatePostResult {
  facebookCreatePost?: {
    postId?: string;
    permalinkUrl?: string | null;
  };
}

export const useFacebookCreatePost = () => {
  const [createPost, { loading }] =
    useMutation<IFacebookCreatePostResult>(FACEBOOK_CREATE_POST);

  return { createPost, loading };
};
