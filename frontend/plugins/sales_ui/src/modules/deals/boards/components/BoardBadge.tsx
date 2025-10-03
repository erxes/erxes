import { Badge, Skeleton, TextOverflowTooltip, toast } from 'erxes-ui';

import { IBoard } from '@/deals/types/boards';
import React from 'react';
import { useBoardDetail } from '../hooks/useBoards';

export const BoardBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    board?: IBoard;
    boardId?: string;
    renderClose?: (board: IBoard) => React.ReactNode;
    onCompleted?: (board: IBoard) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { board, boardId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { boardDetail, loading } = useBoardDetail({
      variables: {
        _id: boardId,
      },
      skip: !boardId,
      onCompleted: (data) => {
        onCompleted?.(data?.salesBoardDetail);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    const boardValue = board || boardDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!boardValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={boardValue?.name} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={boardValue?.name} />
      </Badge>
    );
  },
);
