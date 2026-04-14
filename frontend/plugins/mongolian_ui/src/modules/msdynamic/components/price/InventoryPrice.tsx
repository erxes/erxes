import { Button, Card, Select } from 'erxes-ui/components';
import AccordionSection from '../common/AccordionSection';
import Row from './InventoryPriceRow';

const InventoryPrice = ({
  items,
  loading,
  queryParams,
  setBrand,
  toSyncPrices,
}: {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toSyncPrices: () => void;
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

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
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

      {/* Sections */}
      <AccordionSection
        title="Update product price"
        count={items?.update?.items?.length}
      >
        {renderTable(items?.update?.items || [], 'UPDATE')}
      </AccordionSection>

      <AccordionSection
        title="Matched product price"
        count={items?.match?.items?.length}
      >
        {renderTable(items?.match?.items || [], 'MATCH')}
      </AccordionSection>

      <AccordionSection
        title="Not created product"
        count={items?.create?.items?.length}
      >
        {renderTable(items?.create?.items || [], 'CREATE')}
      </AccordionSection>

      <AccordionSection
        title="Unmatched product"
        count={items?.delete?.items?.length}
      >
        {renderTable(items?.delete?.items || [], 'DELETE')}
      </AccordionSection>

      <AccordionSection
        title="Error product"
        count={items?.error?.items?.length}
      >
        {renderTable(items?.error?.items || [], 'ERROR')}
      </AccordionSection>
    </div>
  );
};

export default InventoryPrice;
