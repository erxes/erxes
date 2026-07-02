import { ScrollArea, Spinner } from 'erxes-ui';

import { IconReceipt } from '@tabler/icons-react';
import { PosOrderRow } from './PosOrderRow';
import { POS_ORDERS_BY_DEAL } from '../graphql/posOrdersByDeal';
import { useQuery } from '@apollo/client';

type IPosOrder = {
  _id: string;
  number?: string;
  paidDate?: string;
  totalAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: Array<{ type: string; amount: number; title?: string }>;
  posName?: string;
};

export const PosOrders = ({ contentId }: { contentId: string }) => {
  const { data, loading } = useQuery(POS_ORDERS_BY_DEAL, {
    variables: { dealId: contentId },
    skip: !contentId,
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const orders: IPosOrder[] = data?.posOrders || [];

  if (orders.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconReceipt />
        </div>
        <span className="text-sm">No POS orders to display at the moment.</span>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-auto">
      <div className="flex flex-col gap-3 p-4">
        {orders.map((order) => (
          <PosOrderRow key={order._id} order={order} />
        ))}
      </div>
    </ScrollArea>
  );
};
