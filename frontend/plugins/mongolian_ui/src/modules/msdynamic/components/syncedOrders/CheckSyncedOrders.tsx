import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

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
  posList: any[];
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
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64">
        <CheckSyncedOrdersSidebar queryParams={queryParams} />
      </div>

      {/* Main */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Check msdynamic</h2>

          {bulk.length > 0 && (
            <Button onClick={handleCheck} disabled={contentLoading}>
              Check
            </Button>
          )}
        </div>

        <Card className="p-4">
          <div className="mb-4 text-sm text-muted-foreground">
            Orders ({totalCount})
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Empty list
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
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
        </Card>
      </div>
    </div>
  );
};

export default CheckSyncedOrders;
