import { cn, Sidebar, useQueryState } from 'erxes-ui';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';

export const TagsSidebar = ({ className }: { className?: string }) => {
  const { types } = useTagTypes();
  const [type, setType] = useQueryState<string>('tagType');

  return (
    <Sidebar collapsible="none" className={cn('border-r flex-none', className)}>
      {Object.entries(types).map(([key, value]) => (
        <Sidebar.Group key={key}>
          <Sidebar.GroupLabel>
            {key === 'core' ? 'Core tags' : `${key} tags`}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {key === 'core' && (
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton
                    isActive={type === null}
                    onClick={() => setType(null)}
                  >
                    Workspace tags
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              )}
              {value.map((_type) => (
                <Sidebar.MenuItem key={_type.contentType}>
                  <Sidebar.MenuButton
                    isActive={type === _type.contentType}
                    onClick={() => setType(_type.contentType)}
                  >
                    {_type.description} tags
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar>
  );
};
