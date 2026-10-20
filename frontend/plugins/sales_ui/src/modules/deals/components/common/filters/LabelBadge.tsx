import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';

import { usePipelineLabelDetail } from '@/deals/pipelines/hooks/usePipelineDetails';
import { IPipelineLabel } from '@/deals/types/pipelines';
import React from 'react';

export const LabelBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    label?: IPipelineLabel;
    labelId?: string;
    renderClose?: (label: IPipelineLabel) => React.ReactNode;
    onCompleted?: (label: IPipelineLabel) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { label, labelId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { pipelineLabelDetail, loading } = usePipelineLabelDetail({
      variables: labelId ? { _id: labelId } : undefined,
      skip: !!label || !labelId,
      onCompleted: ({ salesPipelineLabelDetail }) => {
        if (salesPipelineLabelDetail) onCompleted?.(salesPipelineLabelDetail);
      },
    });

    const labelValue = label || pipelineLabelDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!labelValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={labelValue?.name} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={labelValue?.name} />
      </Badge>
    );
  },
);
