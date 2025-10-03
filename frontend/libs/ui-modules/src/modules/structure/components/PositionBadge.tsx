import { Badge, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { IPosition } from '../types/Position';
import { usePositionById } from '../hooks/usePositionById';

export const PositionBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    position?: IPosition;
    positionId?: string;
    renderClose?: (position: IPosition) => React.ReactNode;
    onCompleted?: (positions: IPosition) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    {
      position,
      positionId,
      renderClose,
      onCompleted,
      renderAsPlainText,
      ...props
    },
    ref,
  ) => {
    const { positionDetail, loading } = usePositionById({
      variables: {
        id: positionId,
      },
      skip: !positionId || !!position,
      onCompleted: ({ positionDetail }: { positionDetail: IPosition }) => {
        onCompleted?.(positionDetail);
      },
    });

    const positionValue = position || positionDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!positionValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={positionValue?.title} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={positionValue?.title} />
      </Badge>
    );
  },
);
