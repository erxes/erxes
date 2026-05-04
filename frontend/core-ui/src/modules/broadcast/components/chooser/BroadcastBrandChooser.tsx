import {
  CUSTOMER_RELATION_TYPE,
  useBroadcastChooser,
} from '@/broadcast/hooks/useBroadcastChooser';
import { Command } from 'erxes-ui';
import { IBrand } from 'ui-modules';

export const BroadcastBrandChooser = ({
  brands,
  value,
  onChange,
}: {
  brands: IBrand[];
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { counts, loading } = useBroadcastChooser({
    countTypes: [CUSTOMER_RELATION_TYPE.BRAND],
  });

  const brandCounts = counts['brand'] || {};

  return (
    <Command>
      <Command.List className="min-h-full">
        {brands.map((brand: IBrand) => (
          <Command.Item
            key={brand._id}
            value={brand._id}
            onSelect={() => {
              if (value?.includes(brand._id)) {
                return onChange([
                  ...(value || []).filter((id: string) => id !== brand._id),
                ]);
              }

              onChange([...(value || []), brand._id]);
            }}
            className={`mb-1 flex justify-between cursor-pointer ${
              value?.includes(brand._id)
                ? 'bg-primary/10 hover:bg-primary/10'
                : ''
            }`}
          >
            <span>{brand.name}</span>
            <span
              className={`ml-2 text-xs text-muted-foreground ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {brandCounts[brand._id] || 0}
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
