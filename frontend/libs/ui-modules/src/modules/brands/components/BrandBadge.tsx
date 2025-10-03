import { Badge, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { IBrand } from '../types/brand';
import { useBrandsByIds } from '../hooks/useBrands';

export const BrandBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    brand?: IBrand;
    brandId?: string;
    renderClose?: (brand: IBrand) => React.ReactNode;
    onCompleted?: (brands: IBrand) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { brand, brandId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { brandDetail, loading } = useBrandsByIds({
      variables: {
        id: brandId,
      },
      skip: !!brand || !brandId,
      onCompleted: ({ brandDetail }: { brandDetail: IBrand }) => {
        onCompleted?.(brandDetail);
      },
    });

    const brandValue = brand || brandDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!brandValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={brandValue?.name} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={brandValue?.name} />
      </Badge>
    );
  },
);
