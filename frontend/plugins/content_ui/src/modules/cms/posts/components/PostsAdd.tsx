import { IconPlus } from '@tabler/icons-react';

import { Button, useScopedHotkeys } from 'erxes-ui';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { useCustomTypes } from '../../custom-types/hooks/useCustomTypes';

export const PostsAdd = ({ clientPortalId }: { clientPortalId: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get('type');
  const { customTypes } = useCustomTypes({ clientPortalId });

  const typeLabel =
    currentType && currentType !== 'post'
      ? (customTypes.find((t) => t.code === currentType)?.label ?? 'Post')
      : 'Post';

  const onOpen = () => {
    const pathSegments = location.pathname.split('/');
    const cmsIndex = pathSegments.findIndex((segment) => segment === 'cms');
    const websiteId =
      cmsIndex > 0 && cmsIndex < pathSegments.length - 1
        ? pathSegments[cmsIndex + 1]
        : clientPortalId;
    const typeParam =
      currentType && currentType !== 'post' ? `?type=${currentType}` : '';
    navigate(`/content/cms/${websiteId}/posts/add${typeParam}`);
  };

  useScopedHotkeys(`c`, () => onOpen(), PostsHotKeyScope.PostsPage);

  return (
    <Button onClick={onOpen}>
      <IconPlus />
      Add {typeLabel}
    </Button>
  );
};
