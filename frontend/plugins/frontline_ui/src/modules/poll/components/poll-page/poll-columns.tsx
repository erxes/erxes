import {
  IconCalendarEvent,
  IconChartBar,
  IconEdit,
  IconLabel,
  IconList,
  IconSend,
  IconSquareToggle,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { PollResultsDialog } from '@/poll/components/poll-page/PollResultsDialog';
import { PollSheet } from '@/poll/components/poll-page/PollSheet';
import {
  usePollRemove,
  usePollToggleStatus,
} from '@/poll/hooks/usePollMutations';
import { IPoll, POLL_STATUS } from '@/poll/types/pollTypes';

const PollMoreColumnCell = ({ cell }: { cell: Cell<IPoll, unknown> }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const poll = cell.row.original;
  const { togglePollStatus } = usePollToggleStatus();
  const { removePolls } = usePollRemove();

  const onError = (error: Error) =>
    toast({
      title: t('error'),
      variant: 'destructive',
      description: error.message,
    });

  const handleToggle = () =>
    togglePollStatus({
      variables: {
        _ids: [poll._id],
        status:
          poll.status === POLL_STATUS.ACTIVE
            ? POLL_STATUS.ARCHIVED
            : POLL_STATUS.ACTIVE,
      },
      onCompleted: () => setOpen(false),
      onError,
    });

  const handleRemove = () =>
    removePolls({
      variables: { _ids: [poll._id] },
      onCompleted: () => {
        setOpen(false);
        toast({ variant: 'success', title: t('poll-removed') });
      },
      onError,
    });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="start">
        <PollSheet
          poll={poll}
          trigger={
            <DropdownMenu.Item onSelect={(event) => event.preventDefault()}>
              <IconEdit />
              {t('edit')}
            </DropdownMenu.Item>
          }
        />
        <PollResultsDialog
          pollId={poll._id}
          trigger={
            <DropdownMenu.Item onSelect={(event) => event.preventDefault()}>
              <IconChartBar />
              {t('poll-results')}
            </DropdownMenu.Item>
          }
        />
        <DropdownMenu.Item onSelect={handleToggle}>
          <IconSquareToggle />
          {poll.status === POLL_STATUS.ACTIVE ? t('archive') : t('unarchive')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={handleRemove}>
          <IconTrash />
          {t('remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const pollColumns: ColumnDef<IPoll>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    size: 33,
    cell: PollMoreColumnCell,
  },
  RecordTable.checkboxColumn as ColumnDef<IPoll>,
  {
    accessorKey: 'title',
    id: 'title',
    header: function PollTitleHeader() {
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('col-name')} icon={IconLabel} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    accessorKey: 'question',
    id: 'question',
    header: function PollQuestionHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead label={t('poll-question')} icon={IconList} />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 280,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: function PollStatusHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead label={t('status')} icon={IconToggleRight} />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <FormStatus.Badge status={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    accessorKey: 'sentCount',
    id: 'sentCount',
    header: function PollSentCountHeader() {
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('poll-sent')} icon={IconSend} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{(cell.getValue() as number) || 0}</Badge>
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: function PollCreatedAtHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('created-at')}
          icon={IconCalendarEvent}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];
