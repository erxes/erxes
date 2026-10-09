import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';

import { IBranch } from '../types/Branch';
import React from 'react';
import { useBranchById } from '../hooks/useBranchById';

export const BranchBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    branch?: IBranch;
    branchId?: string;
    renderClose?: (branch: IBranch) => React.ReactNode;
    onCompleted?: (branches: IBranch) => void;
    renderAsPlainText?: boolean;
    showMissingId?: boolean;
  }
>(
  (
    {
      branch,
      branchId,
      renderClose,
      onCompleted,
      renderAsPlainText,
      showMissingId,
      ...props
    },
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
      if (showMissingId && branchId) {
        if (renderAsPlainText) {
          return <TextOverflowTooltip value={branchId} />;
        }
        return (
          <Badge
            ref={ref}
            variant="secondary"
            className="font-mono"
            title={`Unknown id: ${branchId}`}
            onClose={props.onClose}
          >
            <span className="max-w-24 truncate">{branchId}</span>
          </Badge>
        );
      }
      return null;
    }

    const code = branchValue.code && (
      <span className="text-muted-foreground shrink-0">{branchValue.code}</span>
    );

    if (renderAsPlainText) {
      return (
        <span className="flex overflow-hidden gap-2 items-center">
          {code}
          <TextOverflowTooltip value={branchValue.title} />
        </span>
      );
    }

    return (
      <Badge ref={ref} {...props}>
        {code}
        <TextOverflowTooltip value={branchValue.title} />
      </Badge>
    );
  },
);
