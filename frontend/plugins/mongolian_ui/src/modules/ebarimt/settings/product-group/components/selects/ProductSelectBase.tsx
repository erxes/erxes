import { useState, useMemo } from 'react';
import { Combobox, Command, Form, Popover } from 'erxes-ui';

interface IProductOption {
  _id: string;
  name: string;
  code?: string;
}

export const ProductSelectBase = ({
  value,
  onValueChange,
  disabled,
  loading,
  products,
  placeholder,
}: Readonly<{
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  products: IProductOption[];
  placeholder: string;
}>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products?.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const selected = products?.find((p) => p._id === value);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch('');
      }}
    >
      <Form.Control>
        <Combobox.Trigger
          className="w-full shadow-xs"
          disabled={disabled || loading}
        >
          {selected ? (
            <span className="font-medium text-sm truncate">
              {selected.name}
              {selected.code ? ` (${selected.code})` : ''}
            </span>
          ) : (
            <span className="text-accent-foreground/80">{placeholder}</span>
          )}
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            placeholder="Search product..."
            value={search}
            onValueChange={setSearch}
          />
          <Command.Empty>No products found</Command.Empty>
          <Command.List>
            {filtered?.map((product) => (
              <Command.Item
                key={product._id}
                value={product._id}
                onSelect={() => {
                  onValueChange(product._id);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <span>
                  {product.name}
                  {product.code ? ` (${product.code})` : ''}
                </span>
                <Combobox.Check checked={product._id === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
