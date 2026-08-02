import { useMutation } from '@apollo/client';
import { FACEBOOK_CREATE_POST } from '../graphql/mutations/fbPost';

export interface IFacebookCreatePostResult {
  facebookCreatePost?: {
    postId?: string;
    permalinkUrl?: string | null;
  };
}

/** Publishes a post (optionally with images) to a connected Facebook page. */
export const useFacebookCreatePost = () => {
  const [createPost, { loading }] =
    useMutation<IFacebookCreatePostResult>(FACEBOOK_CREATE_POST);

  return { createPost, loading };
};
