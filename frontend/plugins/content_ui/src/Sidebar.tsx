import { Sidebar } from 'erxes-ui';
import { ContentNavigation } from '@/ContentNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const ContentSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <ContentNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
