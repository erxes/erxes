import { Sidebar } from 'erxes-ui';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  IPostsFieldType,
  usePostsFieldTypes,
} from '../posts/constants/postsFieldTypes';

export const CmsSidebar = () => {
  const postsFieldTypes = usePostsFieldTypes();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Content Management</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {postsFieldTypes.map((item) => (
              <Sidebar.MenuItem key={item.value}>
                <CmsSidebarItem item={item} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const CmsSidebarItem = ({ item }: { item: IPostsFieldType }) => {
  const { websiteId } = useParams();
  const location = useLocation();
  const href = `/content/cms/${websiteId || ''}${item.value}`;
  const isActive = location.pathname === href;

  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={href}>
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Link>
    </Sidebar.MenuButton>
  );
};
