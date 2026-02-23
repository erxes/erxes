import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

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
          <Button
            size="sm"
            onClick={() => toSyncCustomers(action, syncable)}
          >
            Sync
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((c, index) => (
                <Row key={index} customers={c} action={action} />
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
      <div className="py-10 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Filter Bar */}
      <Card className="p-4 flex items-center gap-4">
        <Button onClick={toCheckCustomers}>
          Check
        </Button>

        {items?.matched && (
          <span className="ml-auto text-sm text-muted-foreground">
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