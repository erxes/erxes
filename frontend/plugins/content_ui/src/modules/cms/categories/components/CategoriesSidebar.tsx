import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { usePostsFieldTypes } from '../../posts/constants/postsFieldTypes';

export const CategoriesSidebar = () => {
  const postsFieldTypes = usePostsFieldTypes();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Content Management</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {postsFieldTypes.map((categoryType) => (
              <Sidebar.MenuItem key={categoryType.value}>
                <CategoriesMenuItem categoryType={categoryType} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const CategoriesMenuItem = ({ categoryType }: { categoryType: any }) => {
  const location = useLocation();

  const pathSegments = location.pathname.split('/');
  const websiteIdIndex =
    pathSegments.findIndex((segment) => segment === 'cms') + 1;
  const websiteId =
    websiteIdIndex > 0 && websiteIdIndex < pathSegments.length
      ? pathSegments[websiteIdIndex]
      : '';

  const currentPath = `/content/cms/${websiteId}${categoryType.value}`;
  const isActive = location.pathname === currentPath;

  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={currentPath}>{categoryType.label}</Link>
    </Sidebar.MenuButton>
  );
};
