import { Sidebar } from 'erxes-ui';
import { ContentNavigation } from '@/ContentNavigation';
import { ContentSubNavigation } from '@/ContentSubNavigation';

export const ContentSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <ContentNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <ContentSubNavigation />
  </>
);
