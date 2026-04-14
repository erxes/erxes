import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';
import SyncHistoryList from '@/msdynamic/containers/SyncHistoryList';
import CheckSyncedOrdersContainer from '@/msdynamic/containers/CheckSyncedOrders';
// later add others

const MsdynamicPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <MsdynamicTopNav />

      <div id="sync-history">
        <SyncHistoryList />
      </div>

      <div id="check-orders" style={{ marginTop: 40 }}>
        <CheckSyncedOrdersContainer />
      </div>

      {/* later */}
      {/* <div id="check-products">...</div> */}
      {/* <div id="check-customers">...</div> */}
    </div>
  );
};

export default MsdynamicPage;
