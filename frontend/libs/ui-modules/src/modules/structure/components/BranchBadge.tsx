import { Badge, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { IBranch } from '../types/Branch';
import { useBranchById } from '../hooks/useBranchById';

export const BranchBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    branch?: IBranch;
    branchId?: string;
    renderClose?: (branch: IBranch) => React.ReactNode;
    onCompleted?: (branches: IBranch) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { branch, branchId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { branchDetail, loading } = useBranchById({
      variables: {
        id: branchId,
      },
      skip: !!branch || !branchId,
      onCompleted: ({ branchDetail }: { branchDetail: IBranch }) => {
        onCompleted?.(branchDetail);
      },
    });

    const branchValue = branch || branchDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!branchValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={branchValue?.title} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={branchValue?.title} />
      </Badge>
    );
  },
);
