import { IconPlus } from '@tabler/icons-react';

import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';

export const PostsAdd = ({ clientPortalId }: { clientPortalId: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onOpen = () => {
    // Check if current path already has /cms/ prefix
    if (location.pathname.includes('/cms/')) {
      navigate('add');
    } else {
      navigate(`/cms/${clientPortalId}/posts/add`);
    }
  };

  useScopedHotkeys(`c`, () => onOpen(), PostsHotKeyScope.PostsPage);

  return (
    <Button onClick={onOpen}>
      <IconPlus />
      Add Post
      <Kbd>C</Kbd>
    </Button>
  );
};
