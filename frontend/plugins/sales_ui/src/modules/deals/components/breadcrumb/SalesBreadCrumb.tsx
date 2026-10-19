import { IconCards, IconLayoutCards } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';

import { useBoardDetail } from '@/deals/boards/hooks/useBoards';
import { usePipelineDetail } from '@/deals/boards/hooks/usePipelines';
import { createFavoriteBreadcrumb, FavoriteToggleIconButton } from 'ui-modules';

export const SalesBreadCrumb = ({
  boardId,
  pipelineId,
}: {
  boardId?: string;
  pipelineId?: string | null;
}) => {
  const { boardDetail, loading: boardLoading } = useBoardDetail({
    variables: boardId ? { _id: boardId } : undefined,
    skip: !boardId,
  });

  const { pipelineDetail, loading: pipelineLoading } = usePipelineDetail({
    variables: pipelineId ? { _id: pipelineId } : undefined,
    skip: !pipelineId,
  });

  if (boardLoading || pipelineLoading) {
    return <Skeleton className="w-12 h-lh" />;
  }

  const breadcrumb = createFavoriteBreadcrumb(
    'Sales',
    boardId ? boardDetail?.name || 'Unknown' : undefined,
    pipelineId ? pipelineDetail?.name || 'Unknown' : undefined,
  );

  return (
    <>
      {boardDetail && (
        <>
          <Breadcrumb.Item className="min-w-32">
            <Button variant="ghost" asChild className="min-w-0">
              <span className="flex items-center gap-1">
                <IconLayoutCards />
                <TextOverflowTooltip
                  value={boardDetail.name}
                  className="min-w-0"
                />
              </span>
            </Button>
          </Breadcrumb.Item>
          <Separator.Inline />
        </>
      )}

      {pipelineDetail && (
        <Breadcrumb.Item className="min-w-32">
          <Button variant="ghost" asChild className="min-w-0">
            <span className="flex items-center gap-1">
              <IconCards />
              <TextOverflowTooltip
                value={pipelineDetail.name}
                className="min-w-0"
              />
            </span>
          </Button>
        </Breadcrumb.Item>
      )}
      <Breadcrumb.Item className="ml-1 shrink-0">
        <FavoriteToggleIconButton
          breadcrumb={breadcrumb}
          icon="IconBriefcase"
        />
      </Breadcrumb.Item>
    </>
  );
};
