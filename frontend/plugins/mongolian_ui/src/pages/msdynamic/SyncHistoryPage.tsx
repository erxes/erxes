import { useLocation } from 'react-router-dom';
import SyncHistoryListContainer from '@/msdynamic/containers/SyncHistoryList';

export const SyncHistoryListPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return <SyncHistoryListContainer queryParams={queryParams} />;
};

export default SyncHistoryListPage;
