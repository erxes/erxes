import { Breadcrumb, Button, Separator, Skeleton } from 'erxes-ui';
import { IconCards, IconLayoutCards } from '@tabler/icons-react';

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
    variables: { _id: boardId },
    skip: !boardId,
  });

  const { pipelineDetail, loading: pipelineLoading } = usePipelineDetail({
    variables: { _id: pipelineId },
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
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <span className="flex items-center gap-1">
                <IconLayoutCards />
                {boardDetail?.name}
              </span>
            </Button>
          </Breadcrumb.Item>
          <Separator.Inline />
        </>
      )}

      {pipelineDetail && (
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <span className="flex items-center gap-1">
              <IconCards />
              {pipelineDetail?.name}
            </span>
          </Button>
        </Breadcrumb.Item>
      )}
      <Breadcrumb.Item className="ml-1">
        <FavoriteToggleIconButton
          breadcrumb={breadcrumb}
          icon="IconBriefcase"
        />
      </Breadcrumb.Item>
    </>
  );
};
