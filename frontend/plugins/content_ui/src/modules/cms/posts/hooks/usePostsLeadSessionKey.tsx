import { useLocation } from 'react-router';
import { PostsPath } from '../types/path/PostsPath';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';

export const useIsPostsLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isLead = pathname.includes(PostsPath.Posts);

  return {
    isLead,
    sessionKey: isLead ? POSTS_CURSOR_SESSION_KEY : '',
  };
};
