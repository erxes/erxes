import { usePipelineRemove } from '@/pipelines/hooks/usePipelineRemove';
import { IPipeline } from '@/pipelines/types';
import {
  IconCalendarPlus,
  IconCalendarUp,
  IconGitBranch,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { createPipelineSheetState } from '@/pipelines/states/pipelineStates';
import { useSetAtom } from 'jotai';

type PipelineCellProps = {
  cell: Cell<IPipeline, unknown>;
};

const PipelineNameCell = ({ cell }: PipelineCellProps) => {
  const navigate = useNavigate();
  const { _id, channelId } = cell.row.original;

  return (
    <RecordTableInlineCell
      onClick={() =>
        navigate(`/settings/frontline/channels/${channelId}/pipelines/${_id}`)
      }
    >
      <span className="flex items-center gap-2 font-medium">
        <IconGitBranch className="size-4 shrink-0 text-muted-foreground" />
        {cell.getValue() as string}
      </span>
    </RecordTableInlineCell>
  );
};

const PipelineCreatedByCell = ({ cell }: PipelineCellProps) => {
  return (
    <RecordTableInlineCell>
      {cell.row.original.createdUser?.details?.fullName || '—'}
    </RecordTableInlineCell>
  );
};

const PipelineDeleteItem = ({ pipelineId }: { pipelineId: string }) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removePipeline, loading } = usePipelineRemove();

  const onRemove = () => {
    confirm({
      message: t('confirm-remove-pipeline'),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removePipeline({ variables: { id: pipelineId } });
    });
  };

  return (
    <Command.Item
      className="text-destructive"
      disabled={loading}
      onSelect={onRemove}
      value="delete"
    >
      {loading ? <Spinner size="sm" /> : <IconTrash />}
      {t('delete')}
    </Command.Item>
  );
};

const PipelineMoreMenu = ({ pipelineId }: { pipelineId: string }) => (
  <Command shouldFilter={false}>
    <Command.List>
      <PipelineDeleteItem pipelineId={pipelineId} />
    </Command.List>
  </Command>
);

const PipelineMoreCell = ({ cell }: PipelineCellProps) => {
  const { _id } = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="size-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <PipelineMoreMenu pipelineId={_id} />
      </Combobox.Content>
    </Popover>
  );
};

const usePipelineColumns = (): ColumnDef<IPipeline>[] => {
  const { t } = useTranslation('frontline');

  return [
    {
      id: 'more',
      cell: PipelineMoreCell,
      size: 33,
    },
    {
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name')} />,
      cell: PipelineNameCell,
      size: 360,
    },
    {
      id: 'createdUser',
      header: () => (
        <RecordTable.InlineHead icon={IconUser} label={t('created-by')} />
      ),
      cell: PipelineCreatedByCell,
      size: 180,
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead
          icon={IconCalendarPlus}
          label={t('created-at')}
        />
      ),
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
      size: 160,
    },
    {
      accessorKey: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead
          icon={IconCalendarUp}
          label={t('col-updated-at')}
        />
      ),
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
      size: 160,
    },
  ];
};

export const PipelinesList = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline');
  const columns = usePipelineColumns();
  const setCreatePipelineOpen = useSetAtom(createPipelineSheetState);
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: { channelId },
    },
  });

  if (!loading && pipelines?.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>{t('no-pipelines-yet')}</Empty.Title>
          <Empty.Description>{t('no-pipelines-description')}</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button onClick={() => setCreatePipelineOpen(true)} type="button">
            <IconPlus />
            {t('create-pipeline')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      className="m-3"
      columns={columns}
      stickyColumns={['name']}
      data={pipelines || []}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={8} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
