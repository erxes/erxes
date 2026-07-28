import { NavSidebar } from '../../../shared/components/NavSidebar';
import { PUT_RESPONSE_ROUTES } from './PutResponseRoutes';

export const PutResponseSidebar = () => (
  <NavSidebar
    routes={PUT_RESPONSE_ROUTES}
    pathPrefix="mongolian/put-response"
    groupLabel="put-response"
  />
);
