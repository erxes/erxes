import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useBroadcastCampaignActions } from '../../hooks/useBroadcastCampaignActions';
import { BroadcastDelete } from './BroadcastDelete';
import { useTranslation } from 'react-i18next';

export const BroadcastCommandBar = () => {
  const { t } = useTranslation('broadcasts');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const broadcastIds = selectedRows.map((row: Row<any>) => row.original._id);

  // Starting and pausing act on one campaign, so they are only offered when
  // the selection is one. Deleting takes the whole selection.
  const only = selectedRows.length === 1 ? selectedRows[0].original : null;

  const { canGoLive, canResume, canPause, goLiveLabel, goLive, pause } =
    useBroadcastCampaignActions(only, {
      // The rows acted on are no longer in the state they were selected in.
      onDone: () => selectedRows.forEach((row) => row.toggleSelected(false)),
    });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('command-bar.selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <BroadcastDelete broadcastIds={broadcastIds} rows={selectedRows} />
        {(canGoLive || canResume) && (
          <Can action="broadcastUpdate">
            <Button
              variant="secondary"
              className="text-success"
              onClick={goLive}
            >
              <IconPlayerPlayFilled />
              {goLiveLabel}
            </Button>
          </Can>
        )}
        {canPause && (
          <Can action="broadcastUpdate">
            <Button
              variant="secondary"
              className="text-warning"
              onClick={pause}
            >
              <IconPlayerPauseFilled />
              {t('actions.pause')}
            </Button>
          </Can>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
