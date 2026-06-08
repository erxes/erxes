import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  IconBuildingStore,
  IconLink,
  IconSettings,
  IconSitemap,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import {
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  useBoardDetail,
  usePipelineDetail,
  useStageDetail,
} from 'ui-modules/modules/sales/hooks';

import { msDynamicConfigDetailAtom } from '../../states/msDynamicConfigStates';
import { MSMDynamicConfigRow } from '../../types';
import { msDynamicMoreColumn } from './MSDynamicMoreColumn';

export const MSDynamicConfigTitleCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => {
  const setEditDetail = useSetAtom(msDynamicConfigDetailAtom);

  return (
    <RecordTableInlineCell
      className="cursor-pointer"
      onClick={() => setEditDetail(cell.row.original)}
    >
      <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
    </RecordTableInlineCell>
  );
};

export const MSDynamicTextCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => (
  <RecordTableInlineCell>
    <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
  </RecordTableInlineCell>
);

export const MSDynamicBoardCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => {
  const { boardId } = cell.row.original;
  const { boardDetail, loading } = useBoardDetail({
    variables: { _id: boardId },
    skip: !boardId,
  });

  if (loading) {
    return (
      <RecordTableInlineCell>
        <Skeleton className="h-4 w-24" />
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={boardDetail?.name || boardId || '-'} />
    </RecordTableInlineCell>
  );
};

export const MSDynamicPipelineCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => {
  const { pipelineId } = cell.row.original;
  const { pipelineDetail, loading } = usePipelineDetail({
    variables: { _id: pipelineId },
    skip: !pipelineId,
  });

  if (loading) {
    return (
      <RecordTableInlineCell>
        <Skeleton className="h-4 w-24" />
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={pipelineDetail?.name || pipelineId || '-'} />
    </RecordTableInlineCell>
  );
};

export const MSDynamicStageCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => {
  const { stageId } = cell.row.original;
  const { stageDetail, loading } = useStageDetail({
    variables: { _id: stageId },
    skip: !stageId,
  });

  if (loading) {
    return (
      <RecordTableInlineCell>
        <Skeleton className="h-4 w-24" />
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={stageDetail?.name || stageId || '-'} />
    </RecordTableInlineCell>
  );
};

export const msDynamicConfigColumns: ColumnDef<MSMDynamicConfigRow>[] = [
  msDynamicMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<MSMDynamicConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconSettings} label="Title" />,
    cell: ({ cell }) => <MSDynamicConfigTitleCell cell={cell} />,
    size: 240,
  },
  {
    id: 'boardId',
    accessorKey: 'boardId',
    header: () => <RecordTable.InlineHead icon={IconBuildingStore} label="Board" />,
    cell: ({ cell }) => <MSDynamicBoardCell cell={cell} />,
    size: 220,
  },
  {
    id: 'pipelineId',
    accessorKey: 'pipelineId',
    header: () => <RecordTable.InlineHead icon={IconSitemap} label="Pipeline" />,
    cell: ({ cell }) => <MSDynamicPipelineCell cell={cell} />,
    size: 220,
  },
  {
    id: 'stageId',
    accessorKey: 'stageId',
    header: () => <RecordTable.InlineHead icon={IconSitemap} label="Stage" />,
    cell: ({ cell }) => <MSDynamicStageCell cell={cell} />,
    size: 220,
  },
  {
    id: 'posConf',
    accessorKey: 'posConf',
    header: () => (
      <RecordTable.InlineHead icon={IconSettings} label="POS config" />
    ),
    cell: ({ cell }) => <MSDynamicTextCell cell={cell} />,
    size: 220,
  },
  {
    id: 'productUrl',
    accessorKey: 'productUrl',
    header: () => (
      <RecordTable.InlineHead icon={IconLink} label="Product URL" />
    ),
    cell: ({ cell }) => <MSDynamicTextCell cell={cell} />,
    size: 280,
  },
];
