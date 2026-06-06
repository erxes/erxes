import { Sidebar } from 'erxes-ui';
import { IconFileDescription } from '@tabler/icons-react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  IPostsFieldType,
  usePostsFieldTypes,
} from '../posts/constants/postsFieldTypes';
import { useCustomTypes } from '../custom-types/hooks/useCustomTypes';
import { PostsPath } from '../posts/types/path/PostsPath';

export const CmsSidebar = () => {
  const { websiteId } = useParams();
  const postsFieldTypes = usePostsFieldTypes();
  const { customTypes } = useCustomTypes({ clientPortalId: websiteId });

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Content Management</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {postsFieldTypes.map((item) =>
              item.value === PostsPath.Posts ? (
                <PostsMenuItemWithTypes
                  key={item.value}
                  item={item}
                  customTypes={customTypes}
                />
              ) : (
                <Sidebar.MenuItem key={item.value}>
                  <CmsSidebarItem item={item} />
                </Sidebar.MenuItem>
              ),
            )}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const PostsMenuItemWithTypes = ({
  item,
  customTypes,
}: {
  item: IPostsFieldType;
  customTypes: any[];
}) => {
  const { websiteId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const href = `/content/cms/${websiteId || ''}${item.value}`;
  const currentType = searchParams.get('type');
  const isPostsActive = location.pathname === href && !currentType;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton isActive={isPostsActive} asChild>
        <Link to={href}>
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </Link>
      </Sidebar.MenuButton>
      {customTypes.length > 0 && (
        <Sidebar.Menu>
          {customTypes.map((type) => {
            const typeHref = `${href}?type=${type.code}`;
            const isTypeActive =
              location.pathname === href && currentType === type.code;
            return (
              <Sidebar.MenuItem key={type._id}>
                <Sidebar.MenuButton isActive={isTypeActive} asChild>
                  <Link to={typeHref}>
                    <IconFileDescription className="w-4 h-4" />
                    <span>{type.pluralLabel || type.label}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            );
          })}
        </Sidebar.Menu>
      )}
    </Sidebar.MenuItem>
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
