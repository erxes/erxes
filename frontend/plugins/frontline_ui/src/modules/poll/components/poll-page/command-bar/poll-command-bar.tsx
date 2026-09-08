import { IconSquareToggle, IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  usePollRemove,
  usePollToggleStatus,
} from '@/poll/hooks/usePollMutations';
import { IPoll, POLL_STATUS } from '@/poll/types/pollTypes';

export const PollCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { removePolls, loading: removing } = usePollRemove();
  const { togglePollStatus, loading: toggling } = usePollToggleStatus();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const pollIds = selectedRows.map((row: Row<IPoll>) => row.original._id);

  const onError = (error: Error) =>
    toast({
      title: t('error'),
      variant: 'destructive',
      description: error.message,
    });

  const handleRemove = () =>
    removePolls({
      variables: { _ids: pollIds },
      onCompleted: () => {
        table.resetRowSelection();
        toast({ variant: 'success', title: t('poll-removed') });
      },
      onError,
    });

  const handleArchive = () =>
    togglePollStatus({
      variables: { _ids: pollIds, status: POLL_STATUS.ARCHIVED },
      onCompleted: () => table.resetRowSelection(),
      onError,
    });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleArchive} disabled={toggling}>
          <IconSquareToggle />
          {t('archive')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleRemove}
          disabled={removing}
        >
          <IconTrash />
          {t('remove')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
