import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { usePostsFieldTypes } from '../../posts/constants/postsFieldTypes';

export const PagesSidebar = () => {
  const postsFieldTypes = usePostsFieldTypes();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Content Management</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {postsFieldTypes.map((postType) => (
              <Sidebar.MenuItem key={postType.value}>
                <PagesMenuItem postType={postType} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const PagesMenuItem = ({ postType }: { postType: any }) => {
  const location = useLocation();

  const pathSegments = location.pathname.split('/');
  const websiteIdIndex =
    pathSegments.findIndex((segment) => segment === 'cms') + 1;
  const websiteId =
    websiteIdIndex > 0 && websiteIdIndex < pathSegments.length
      ? pathSegments[websiteIdIndex]
      : '';

  const currentPath = `/content/cms/${websiteId}${postType.value}`;
  const isActive = location.pathname === currentPath;

  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={currentPath}>{postType.label}</Link>
    </Sidebar.MenuButton>
  );
};
