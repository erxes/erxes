import { useLocation } from 'react-router-dom';
import CheckSyncedOrdersContainer from '@/msdynamic/containers/CheckSyncedOrders';

export const CheckSyncedOrdersPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return <CheckSyncedOrdersContainer queryParams={queryParams} />;
};

export default CheckSyncedOrdersPage;
