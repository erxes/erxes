import { Sidebar } from 'erxes-ui';
import { InsuranceNavigation } from '@/InsuranceNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const InsuranceSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <InsuranceNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
