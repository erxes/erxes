import { gql, useQuery } from '@apollo/client';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Combobox } from 'erxes-ui/components/combobox';
import { Popover } from 'erxes-ui/components/popover';
import { Command } from 'erxes-ui/components/command';

import Row from './InventoryProductsRow';

type Props = {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toCheckProducts: () => void;
  toSyncProducts: (action: string, products: any[]) => void;
  items: any;
};

const BRANDS_QUERY = gql(`
  query Brands {
    brands {
      _id
      name
    }
  }
`);

const InventoryProducts = ({
  items,
  loading,
  queryParams,
  setBrand,
  toCheckProducts,
  toSyncProducts,
}: Props) => {
  const { data: brandsData } = useQuery(BRANDS_QUERY);
  const brands = brandsData?.brands || [];

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

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
          <Button size="sm" onClick={() => toSyncProducts(action, syncable)}>
            Sync
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Unit price</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((p) => (
                <Row key={p.code} product={p} action={action} />
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

  const selectedBrand = brands.find((b: any) => b._id === queryParams.brandId);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <Card className="p-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {items?.matched && `Matched: ${items.matched.count}`}
        </span>

        <Popover>
          <Combobox.Trigger>
            <Combobox.Value
              value={selectedBrand?.name}
              placeholder="Select brand"
            />
          </Combobox.Trigger>

          <Combobox.Content>
            <Command>
              <Command.List>
                {brands.map((brand: any) => (
                  <Command.Item
                    key={brand._id}
                    value={brand.name}
                    onSelect={() => setBrand(brand._id)}
                  >
                    {brand.name}
                    <Combobox.Check
                      checked={queryParams.brandId === brand._id}
                    />
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>

        <Button onClick={toCheckProducts}>Check</Button>
      </Card>

      <Section
        title="Create products"
        data={items?.create?.items || []}
        action="CREATE"
      />

      <Section
        title="Update products"
        data={items?.update?.items || []}
        action="UPDATE"
      />

      <Section
        title="Delete products"
        data={items?.delete?.items || []}
        action="DELETE"
      />
    </div>
  );
};

export default InventoryProducts;
