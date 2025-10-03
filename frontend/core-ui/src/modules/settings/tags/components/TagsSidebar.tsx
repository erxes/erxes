import { Sidebar, Skeleton, useQueryState } from 'erxes-ui';
import { useTagsTypes } from '../hooks/useTagsTypes';
import { Link } from 'react-router-dom';
import { ITagType } from 'ui-modules';

export const TagsSidebar = () => {
  const { tagsGetTypes, loading } = useTagsTypes();

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Tags</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {tagsGetTypes &&
              tagsGetTypes.map((tag: ITagType) => (
                <Sidebar.MenuItem key={tag.contentType}>
                  <TagMenuItem tag={tag} />
                </Sidebar.MenuItem>
              ))}
            {loading &&
              Array.from({ length: 10 }).map((_, index) => (
                <Sidebar.MenuItem key={index}>
                  <Skeleton className="w-full h-4 my-1" />
                </Sidebar.MenuItem>
              ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const TagMenuItem = ({ tag }: { tag: ITagType }) => {
  const [contentType] = useQueryState('contentType');
  const isActive = tag.contentType === contentType;
  return (
    <Link to={`/settings/tags?contentType=${tag.contentType}`}>
      <Sidebar.MenuButton isActive={isActive}>
        {tag.description}
      </Sidebar.MenuButton>
    </Link>
  );
};
