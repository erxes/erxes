import { Sidebar } from 'erxes-ui';
import { TourismNavigation } from '@/TourismNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const TourismSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <TourismNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
