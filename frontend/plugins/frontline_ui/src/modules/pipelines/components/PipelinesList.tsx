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
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  IconArrowBarToRight,
  IconCalendarPlus,
  IconCalendarUp,
  IconEdit,
  IconGitBranch,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';

import { ChannelResourceType } from '@/channels/types';
import { IPipeline } from '@/pipelines/types';
import { MoveToChannelDialog } from '@/channels/components/move-resources/MoveToChannelDialog';
import {
  getPipelineDraftId,
  parsePipelineRecordId,
} from '@/pipelines/constants/pipelineTabs';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useSidePanel } from 'ui-modules';
import { usePipelineRemove } from '@/pipelines/hooks/usePipelineRemove';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PipelineCellProps = {
  cell: Cell<IPipeline, unknown>;
};

const PipelineNameCell = ({ cell }: PipelineCellProps) => {
  const { openRecord } = useSidePanel();
  const { _id } = cell.row.original;

  return (
    <RecordTableInlineCell
      onClick={() =>
        openRecord({ contentType: PIPELINE_CONTENT_TYPE, contentId: _id })
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { confirm } = useConfirm();
  const { removePipeline, loading } = usePipelineRemove();
  const panel = useSidePanel();
  const panelRef = useRef<typeof panel | null>(panel);
  useEffect(() => {
    panelRef.current = panel;
    return () => {
      panelRef.current = null;
    };
  }, [panel]);

  const onRemove = () => {
    confirm({
      message: t(
        'confirm-remove-pipeline',
        'Are you sure you want to delete this pipeline?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removePipeline({ variables: { id: pipelineId } })
        .then(() => {
          const currentPanel = panelRef.current;
          if (
            currentPanel?.record?.contentType === PIPELINE_CONTENT_TYPE &&
            parsePipelineRecordId(currentPanel.record.contentId).pipelineId ===
              pipelineId
          )
            currentPanel.close();
        })
        .catch(() => undefined);
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
      {t('delete', 'Delete')}
    </Command.Item>
  );
};

const PipelineActionCommands = ({
  pipelineId: _id,
  setMenuOpen,
  setMoveOpen,
}: {
  pipelineId: string;
  setMenuOpen: (open: boolean) => void;
  setMoveOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { openRecord } = useSidePanel();
  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item
          value="edit"
          onSelect={() => {
            setMenuOpen(false);
            openRecord({
              contentType: PIPELINE_CONTENT_TYPE,
              contentId: _id,
            });
          }}
        >
          <IconEdit />
          {t('edit', 'Edit')}
        </Command.Item>
        <Command.Item
          value="move"
          onSelect={() => {
            setMenuOpen(false);
            setMoveOpen(true);
          }}
        >
          <IconArrowBarToRight />
          {t('move-to-channel', 'Move to Channel')}
        </Command.Item>
        <PipelineDeleteItem pipelineId={_id} />
      </Command.List>
    </Command>
  );
};

export const PipelineActionsMenu = ({
  pipeline,
  trigger,
}: {
  pipeline: Pick<IPipeline, '_id' | 'channelId'>;
  trigger?: ReactNode;
}) => {
  const { _id, channelId } = pipeline;
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          {trigger ?? <RecordTable.MoreButton className="size-full" />}
        </Popover.Trigger>
        <Combobox.Content>
          <PipelineActionCommands
            pipelineId={_id}
            setMenuOpen={setMenuOpen}
            setMoveOpen={setMoveOpen}
          />
        </Combobox.Content>
      </Popover>
      <MoveToChannelDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        resourceType={ChannelResourceType.PIPELINE}
        resourceIds={[_id]}
        sourceChannelId={channelId ?? ''}
      />
    </>
  );
};

const PipelineMoreCell = ({ cell }: PipelineCellProps) => (
  <PipelineActionsMenu pipeline={cell.row.original} />
);

const usePipelineColumns = (): ColumnDef<IPipeline>[] => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });

  return [
    {
      id: 'more',
      cell: PipelineMoreCell,
      size: 33,
    },
    {
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
      cell: PipelineNameCell,
      size: 360,
    },
    {
      id: 'createdUser',
      header: () => (
        <RecordTable.InlineHead
          icon={IconUser}
          label={t('created-by', 'Created by')}
        />
      ),
      cell: PipelineCreatedByCell,
      size: 180,
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead
          icon={IconCalendarPlus}
          label={t('created-at', 'Created at')}
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
          label={t('col-updated-at', 'updated at')}
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const columns = usePipelineColumns();
  const { openRecord } = useSidePanel();
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
          <Empty.Title>{t('no-pipelines-yet', 'No pipelines yet')}</Empty.Title>
          <Empty.Description>
            {t(
              'no-pipelines-description',
              'Get started by creating your first pipeline to organize and manage your workflow processes.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button
            onClick={() =>
              openRecord({
                contentType: PIPELINE_CONTENT_TYPE,
                contentId: getPipelineDraftId(channelId),
              })
            }
            type="button"
          >
            <IconPlus />
            {t('create-pipeline', 'Create pipeline')}
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
