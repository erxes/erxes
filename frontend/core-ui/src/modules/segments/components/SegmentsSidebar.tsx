import { Sidebar, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';

type Props = {
  types: { contentType: string; description: string }[];
};

export const SegmentListSidebar = ({ types }: Props) => {
  const [selectedContentType] = useQueryState<string>('contentType');

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Segment Types</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {types.map(({ description, contentType }) => (
              <Sidebar.MenuItem key={contentType}>
                <Sidebar.MenuButton
                  isActive={contentType === selectedContentType}
                  asChild
                >
                  <Link to={`?contentType=${contentType}`}>{description}</Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
