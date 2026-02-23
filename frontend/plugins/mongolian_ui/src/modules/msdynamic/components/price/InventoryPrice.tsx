import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

import Row from './InventoryPriceRow';

type Props = {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toSyncPrices: () => void;
  items: any;
};

const InventoryPrice = ({
  items,
  loading,
  queryParams,
  setBrand,
  toSyncPrices,
}: Props) => {
  const renderTable = (data: any[], action: string) => {
    if (!data?.length) {
      return (
        <div className="text-sm text-muted-foreground py-6 text-center">
          Please check first.
        </div>
      );
    }

    return (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Unit price</th>
              <th className="p-2">Ending Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 100).map((p) => (
              <Row key={p.code} price={p} action={action} />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Section = ({
    title,
    data,
    action,
  }: {
    title: string;
    data: any[];
    action: string;
  }) => (
    <Card className="p-4 space-y-4">
      <div className="font-semibold">
        {title} {data?.length ? `: ${data.length}` : ''}
      </div>

      {renderTable(data, action)}
    </Card>
  );

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Action Bar */}
      <Card className="p-4 flex items-center gap-4">
        <Button onClick={toSyncPrices}>Sync</Button>

        {items?.matched && (
          <span className="ml-auto text-sm text-muted-foreground">
            Matched: {items.matched.count}
          </span>
        )}
      </Card>

      <Section
        title="Update product price"
        data={items?.update?.items || []}
        action="UPDATE"
      />

      <Section
        title="Matched product price"
        data={items?.match?.items || []}
        action="MATCH"
      />

      <Section
        title="Not created product"
        data={items?.create?.items || []}
        action="CREATE"
      />

      <Section
        title="Unmatched product"
        data={items?.delete?.items || []}
        action="DELETE"
      />

      <Section
        title="Error product"
        data={items?.error?.items || []}
        action="ERROR"
      />
    </div>
  );
};

export default InventoryPrice;
