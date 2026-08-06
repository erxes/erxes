import { useChannelsRemove } from '@/channels/hooks/useChannelsRemove';
import { IChannel } from '@/channels/types';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ChannelsDelete = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeChannels, loading } = useChannelsRemove();

  const rows = table.getFilteredSelectedRowModel().rows as Row<IChannel>[];
  const channelIds = rows.map((row) => row.original._id);

  const handleDelete = () =>
    confirm({
      message: t('confirm-delete-selected-channels', {
        defaultValue:
          "Delete {{count}} selected channels? This can't be undone.",
        count: channelIds.length,
      }),
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      const { removedIds, failedCount, refreshFailed } = await removeChannels(
        channelIds,
      );

      rows
        .filter((row) => removedIds.includes(row.original._id))
        .forEach((row) => row.toggleSelected(false));

      const description = [
        failedCount
          ? t('channels-removed-with-failures', {
              defaultValue: '{{succeeded}} removed, {{failed}} failed',
              succeeded: removedIds.length,
              failed: failedCount,
            })
          : t('channels-removed', {
              defaultValue: '{{count}} channels removed',
              count: removedIds.length,
            }),
        refreshFailed &&
          t('channels-refresh-failed', {
            defaultValue:
              'Could not refresh the list. Reload the page to see the latest data.',
          }),
      ]
        .filter(Boolean)
        .join(' ');

      return toast(
        failedCount || refreshFailed
          ? { title: t('error', 'Error'), description, variant: 'destructive' }
          : {
              title: t('success', 'Success!'),
              description,
              variant: 'success',
            },
      );
    });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? <Spinner size="sm" /> : <IconTrash />}
      {t('delete', 'Delete')}
    </Button>
  );
};

export const ChannelsCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('n-selected', {
            defaultValue: '{{count}} selected',
            count: selectedCount,
          })}
        </CommandBar.Value>
        <Separator.Inline />
        <ChannelsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};
