import { useLocation } from 'react-router-dom';
import SyncHistoryListContainer from '@/msdynamic/containers/SyncHistoryList';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

export const SyncHistoryListPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return (
    <>
      <SyncHistoryListContainer />
    </>
  );
};

export default SyncHistoryListPage;
