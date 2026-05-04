import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import {
  BrandsInlineContext,
  useBrandsInlineContext,
} from '../contexts/BrandsInlineContext';
import { useBrandInline } from '../hooks/useBrandInline';
import { BrandsInlineProps, IBrand } from '../types/brand';

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
  const { brandIds = [], updateBrands } = useBrandsInlineContext();
  const { brand } = useBrandInline({
    variables: {
      _id: brandId,
    },
    skip: !brandId,
  });

  useEffect(() => {
    if (!brand) return;

    updateBrands?.((prevBrands) => {
      const nextBrands = [
        ...prevBrands.filter((b) => b._id !== brand._id),
        brand,
      ];

      return brandIds
        .map((id) => nextBrands.find((b) => b._id === id))
        .filter((b): b is IBrand => !!b);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  return null;
};

const BrandsInlineTitle = () => {
  const { brandIds = [], brands, loading, placeholder } =
    useBrandsInlineContext();
  const brandLabels =
    brandIds.length > 0
      ? brandIds.map((brandId) => {
          const brand = brands.find((b) => b._id === brandId);
          return brand?.name || brandId;
        })
      : brands.map((brand) => brand.name || brand._id);

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (brandLabels.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (brandLabels.length < 3) {
    return <TextOverflowTooltip value={brandLabels.join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${brandLabels.length} brands`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{brandLabels.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const BrandsInline = Object.assign(BrandsInlineRoot, {
  Provider: BrandsInlineProvider,
  Title: BrandsInlineTitle,
});
