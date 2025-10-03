import { Badge, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { IUnit } from '../types/Unit';
import { useUnitById } from '../hooks/useUnitById';

export const UnitBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    unit?: IUnit;
    unitId?: string;
    renderClose?: (unit: IUnit) => React.ReactNode;
    onCompleted?: (units: IUnit) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { unit, unitId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { unitDetail, loading } = useUnitById({
      variables: {
        _id: unitId,
      },
      skip: !!unit || !unitId,
      onCompleted: ({ unitDetail }: { unitDetail: IUnit }) => {
        onCompleted?.(unitDetail);
      },
    });

    const unitValue = unit || unitDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!unitValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={unitValue?.title} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={unitValue?.title} />
      </Badge>
    );
  },
);
