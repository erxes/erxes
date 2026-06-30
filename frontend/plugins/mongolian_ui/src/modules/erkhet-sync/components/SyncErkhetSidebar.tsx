import { NavSidebar } from '../../shared/components/NavSidebar';
import { SYNC_ERKHET_ROUTES } from './SyncErkhetRoutes';

export const SyncErkhetSidebar = () => (
  <NavSidebar
    routes={SYNC_ERKHET_ROUTES}
    pathPrefix="mongolian/sync-erkhet"
    groupLabel="erkhet-sync"
  />
);
