import {
  Button,
  Input,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IconBuildingStore, IconCheck } from '@tabler/icons-react';
import { useBrands } from 'ui-modules/modules/brands/hooks/useBrands';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

export const ChooseBrand = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { brands, loading } = useBrands({
    variables: { searchValue: debouncedSearch || undefined },
  });

  return (
    <div className="flex flex-col gap-1">
      <Input
        placeholder="Search brands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-7 text-xs"
      />
      {loading ? (
        <>
          <Skeleton className="w-32 h-4 mt-1" />
          <Skeleton className="w-36 h-4 mt-1" />
          <Skeleton className="w-32 h-4 mt-1" />
        </>
      ) : !brands?.length ? (
        <div className="text-sm text-accent-foreground ml-1 my-2">
          No brands found
        </div>
      ) : (
        brands.map((brand) => (
          <BrandItem
            key={brand._id}
            _id={brand._id}
            name={brand.name ?? 'Unnamed brand'}
          />
        ))
      )}
    </div>
  );
};

const BrandItem = ({ _id, name }: { _id: string; name: string }) => {
  const [brandId, setBrandId] = useQueryState<string>('brandId');

  const isActive = brandId === _id;

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left flex-auto p-2"
      onClick={() => setBrandId(_id === brandId ? null : _id)}
    >
      {isActive ? (
        <IconCheck className="" />
      ) : (
        <IconBuildingStore className="size-3 text-accent-foreground shrink-0" />
      )}
      <TextOverflowTooltip value={name} />
    </Button>
  );
};
