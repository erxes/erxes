import { IBrand } from '../types/brand';
import {
  BrandsInlineContext,
  useBrandsInlineContext,
} from '../contexts/BrandsInlineContext';
import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useBrandInline } from '../hooks/useBrandInline';
import { useEffect, useState } from 'react';
import { BrandsInlineProps } from '../types/brand';

const BrandsInlineRoot = (props: BrandsInlineProps) => {
  return (
    <BrandsInlineProvider {...props}>
      <BrandsInlineTitle />
    </BrandsInlineProvider>
  );
};

const BrandsInlineProvider = ({
  children,
  brandIds,
  brands,
  placeholder,
  updateBrands,
}: BrandsInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_brands, _setBrands] = useState<IBrand[]>(brands || []);

  return (
    <BrandsInlineContext.Provider
      value={{
        brands: brands || _brands,
        loading: false,
        brandIds: brandIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select brands'
          : placeholder,
        updateBrands: updateBrands || _setBrands,
      }}
    >
      {children}
      {brandIds?.map((brandId) => (
        <BrandsInlineEffectComponent key={brandId} brandId={brandId} />
      ))}
    </BrandsInlineContext.Provider>
  );
};

const BrandsInlineEffectComponent = ({ brandId }: { brandId: string }) => {
  const { brands, updateBrands } = useBrandsInlineContext();
  const { brand } = useBrandInline({
    variables: {
      _id: brandId,
    },
  
  });

  useEffect(() => {
    const newBrands = [...brands].filter((b) => b._id !== brandId);

    if (brand) {
      updateBrands?.([...newBrands, brand]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  return null;
};

const BrandsInlineTitle = () => {
  const { brands, loading, placeholder } = useBrandsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (brands.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (brands.length < 3) {
    return <TextOverflowTooltip value={brands.map((b) => b.name).join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${brands.length} brands`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {brands.map((brand) => brand.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const BrandsInline = Object.assign(BrandsInlineRoot, {
  Provider: BrandsInlineProvider,
  Title: BrandsInlineTitle,
});
