import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Sidebar } from 'erxes-ui/components/sidebar';

import Row from './CheckSyncedOrdersRow';
import CheckSyncedOrdersSidebar from './CheckSyncedOrdersSidebar';

type Props = {
  totalCount: number;
  loading: boolean;
  orders: any[];
  queryParams: any;
  checkSynced: (
    doc: { orderIds: string[] },
    emptyBulk: () => void,
  ) => Promise<any>;
  unSyncedOrderIds: string[];
  syncedOrderInfos: any;
  toSendMsdOrders: (orderIds: string[]) => void;
};

const CheckSyncedOrders = ({
  totalCount,
  loading,
  orders,
  queryParams,
  checkSynced,
  unSyncedOrderIds,
  syncedOrderInfos,
  toSendMsdOrders,
}: Props) => {
  const [contentLoading, setContentLoading] = useState(false);
  const [bulk, setBulk] = useState<any[]>([]);

  const isAllSelected = orders.length > 0 && bulk.length === orders.length;

  const toggleBulk = (order: any) => {
    setBulk((prev) =>
      prev.includes(order) ? prev.filter((o) => o !== order) : [...prev, order],
    );
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setBulk([]);
    } else {
      setBulk(orders);
    }
  };

  const emptyBulk = () => setBulk([]);

  const handleCheck = async () => {
    if (!window.confirm('Are you sure?')) return;

    try {
      setContentLoading(true);

      const orderIds = bulk.map((o) => o._id);

      await checkSynced({ orderIds }, emptyBulk);
    } finally {
      setContentLoading(false);
    }
  };

  const renderRows = () =>
    orders?.map((order) => (
      <Row
        key={order._id}
        order={order}
        toggleBulk={() => toggleBulk(order)}
        isChecked={bulk.includes(order)}
        isUnsynced={unSyncedOrderIds.includes(order._id)}
        toSend={toSendMsdOrders}
        syncedInfo={syncedOrderInfos[order._id] || {}}
      />
    ));

  return (
  <Sidebar.Inset>
    <div className="flex h-full">
      {/* Filter sidebar */}
      <div className="w-72 border-r bg-muted/20">
        <CheckSyncedOrdersSidebar queryParams={queryParams} />
      </div>

      {/* Main */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Orders ({totalCount})</h2>

          {bulk.length > 0 && (
            <Button onClick={handleCheck} disabled={contentLoading}>
              Check
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <img
              src="/images/actions/8.svg"
              className="w-56 opacity-70 mb-4"
            />
            <p>Empty list</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-2 w-[60px]">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAll}
                    />
                  </th>

                  <th className="p-2">Number</th>
                  <th className="p-2">Total Amount</th>
                  <th className="p-2">Created At</th>
                  <th className="p-2">Paid At</th>
                  <th className="p-2">Synced Date</th>
                  <th className="p-2">Synced bill Number</th>
                  <th className="p-2">Synced customer</th>
                  <th className="p-2">Sync Actions</th>
                </tr>
              </thead>

              <tbody>{renderRows()}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </Sidebar.Inset>
);
};

export default CheckSyncedOrders;