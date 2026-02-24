import { IconPlus } from '@tabler/icons-react';

import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';

export const PostsAdd = ({ clientPortalId }: { clientPortalId: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onOpen = () => {
    const pathSegments = location.pathname.split('/');
    const cmsIndex = pathSegments.findIndex((segment) => segment === 'cms');
    const websiteId =
      cmsIndex > 0 && cmsIndex < pathSegments.length - 1
        ? pathSegments[cmsIndex + 1]
        : clientPortalId;
    navigate(`/content/cms/${websiteId}/posts/add`);
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
