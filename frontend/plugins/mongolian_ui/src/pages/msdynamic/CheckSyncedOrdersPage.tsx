import { useLocation } from 'react-router-dom';
import CheckSyncedOrdersContainer from '@/msdynamic/containers/CheckSyncedOrders';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

export const CheckSyncedOrdersPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return (
    <>
      <CheckSyncedOrdersContainer />
    </>
  );
};

export default CheckSyncedOrdersPage;
