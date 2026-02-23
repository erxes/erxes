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
              <tr className="text-left">
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((p) => (
                <Row key={p.code} category={p} action={action} />
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
      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Product Category</label>

          <Select
            value={queryParams.categoryId || ''}
            onValueChange={(val) => setCategory(val)}
          >
            <Select.Trigger className="w-52">
              <Select.Value placeholder="Select category" />
            </Select.Trigger>

            <Select.Content>
              <Select.Item value="">Clear category filter</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Brand</label>

          <Select
            value={queryParams.brandId || ''}
            onValueChange={(val) => setBrand(val)}
          >
            <Select.Trigger className="w-52">
              <Select.Value placeholder="Select brand" />
            </Select.Trigger>

            <Select.Content>
              <Select.Item value="">No brand</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <Button onClick={toCheckCategory}>Check</Button>

        {items?.matched && (
          <span className="ml-auto text-sm text-muted-foreground">
            Matched: {items.matched.count}
          </span>
        )}
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
