import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Select } from 'erxes-ui/components/select';

import Row from './InventoryCategoryRow';

type Props = {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  setCategory: (categoryId: string) => void;
  toCheckCategory: () => void;
  toSyncCategory: (action: string, categories: any[]) => void;
  items: any;
};

const InventoryCategory = ({
  items,
  loading,
  queryParams,
  setBrand,
  setCategory,
  toCheckCategory,
  toSyncCategory,
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
          <Button size="sm" onClick={() => toSyncCategory(action, syncable)}>
            Sync
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((p) => (
                <Row key={p.code || p.Code} category={p} action={action} />
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

          <span className="text-sm">{open ? '▾' : '▸'}</span>
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
      {/* Top Filters */}
      <Card className="p-4 flex justify-end gap-4 items-center">
        <Select
          value={queryParams.categoryId || ''}
          onValueChange={(val) => setCategory(val)}
        >
          <Select.Trigger className="w-56">
            <Select.Value placeholder="Choose product category" />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="">All categories</Select.Item>
          </Select.Content>
        </Select>

        <Select
          value={queryParams.brandId || ''}
          onValueChange={(val) => setBrand(val)}
        >
          <Select.Trigger className="w-56">
            <Select.Value placeholder="Choose brands" />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="">No brand</Select.Item>
          </Select.Content>
        </Select>

        <Button onClick={toCheckCategory}>Check</Button>
      </Card>

      {/* Sections */}
      <Section
        title="Create categories"
        data={items?.create?.items || []}
        action="CREATE"
      />

      <Section
        title="Update categories"
        data={items?.update?.items || []}
        action="UPDATE"
      />

      <Section
        title="Delete categories"
        data={items?.delete?.items || []}
        action="DELETE"
      />
    </div>
  );
};

export default InventoryCategory;