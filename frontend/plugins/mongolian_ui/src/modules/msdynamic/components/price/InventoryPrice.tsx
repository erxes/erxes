import { useState } from 'react';
import { Button, Card, Select } from 'erxes-ui/components';
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
            <tr>
              <th className="p-2">Code</th>
              <th className="p-2">Unit price</th>
              <th className="p-2">Ending Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.slice(0, 100).map((p) => (
              <Row key={p.code || p.Item_No} price={p} action={action} />
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
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
          onClick={() => setOpen(!open)}
        >
          <div className="font-medium">
            {title} {data?.length ? `(${data.length})` : ''}
          </div>

          <span>{open ? '▾' : '▸'}</span>
        </div>

        {open && <div className="p-4">{renderTable(data, action)}</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 flex justify-end items-center gap-4">
        <Card className="p-4 flex justify-end items-center gap-4">
          <div className="w-64">
            <Select
              value={queryParams?.brandId || ''}
              onValueChange={(value: string) => setBrand(value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose brands" />
              </Select.Trigger>

              <Select.Content>
                {(queryParams?.brands || []).map((b: any) => (
                  <Select.Item key={b.value} value={b.value}>
                    {b.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <Button onClick={toSyncPrices}>Sync</Button>
        </Card>

        <Button onClick={toSyncPrices}>Sync</Button>
      </Card>

      {/* Sections */}
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
