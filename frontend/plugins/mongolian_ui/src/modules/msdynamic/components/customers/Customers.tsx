import { useState } from 'react';
import { Button, Card, Select } from 'erxes-ui/components';
import Row from './CustomerRow';

type Props = {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toCheckCustomers: () => void;
  toSyncCustomers: (action: string, customers: any[]) => void;
  items: any;
};

const Customers = ({
  items,
  loading,
  queryParams,
  setBrand,
  toCheckCustomers,
  toSyncCustomers,
}: Props) => {
  const renderTable = (data: any[], action: string) => {
    if (!data?.length) {
      return (
        <div className="text-sm text-muted-foreground py-6 text-center">
          Please check first.
        </div>
      );
    }

    const syncable = data.filter((d) => d.syncStatus === false);

    return (
      <>
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => toSyncCustomers(action, syncable)}>
            Sync
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.slice(0, 100).map((c) => (
                <Row key={c.code || c.No} customers={c} action={action} />
              ))}
            </tbody>
          </table>
        </div>
      </>
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
      {/* ✅ FIXED TOP BAR */}
      <Card className="p-4 flex justify-end gap-4 items-center">
        {/* Brand Select */}
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

        {/* Actions */}
        <Button onClick={toCheckCustomers}>Check</Button>

        {items?.matched && (
          <span className="text-sm text-muted-foreground">
            Matched: {items.matched.count}
          </span>
        )}
      </Card>

      {/* Sections */}
      <Section
        title="Create customers"
        data={items?.create?.items || []}
        action="CREATE"
      />

      <Section
        title="Update customers"
        data={items?.update?.items || []}
        action="UPDATE"
      />

      <Section
        title="Delete customers"
        data={items?.delete?.items || []}
        action="DELETE"
      />
    </div>
  );
};

export default Customers;
