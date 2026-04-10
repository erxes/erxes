import { Button, Card, Select } from 'erxes-ui/components';
import AccordionSection from '../common/AccordionSection';
import Row from './CustomerRow';

const Customers = ({
  items,
  loading,
  queryParams,
  setBrand,
  toCheckCustomers,
  toSyncCustomers,
}: {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toCheckCustomers: () => void;
  toSyncCustomers: (action: string, customers: any[]) => void;
  items: any;
}) => {
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

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <Card className="p-4 flex justify-end gap-4 items-center">
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

        <Button onClick={toCheckCustomers}>Check</Button>

        {items?.matched && (
          <span className="text-sm text-muted-foreground">
            Matched: {items.matched.count}
          </span>
        )}
      </Card>

      {/* Sections */}
      <AccordionSection
        title="Create customers"
        count={items?.create?.items?.length}
      >
        {renderTable(items?.create?.items || [], 'CREATE')}
      </AccordionSection>

      <AccordionSection
        title="Update customers"
        count={items?.update?.items?.length}
      >
        {renderTable(items?.update?.items || [], 'UPDATE')}
      </AccordionSection>

      <AccordionSection
        title="Delete customers"
        count={items?.delete?.items?.length}
      >
        {renderTable(items?.delete?.items || [], 'DELETE')}
      </AccordionSection>
    </div>
  );
};

export default Customers;
