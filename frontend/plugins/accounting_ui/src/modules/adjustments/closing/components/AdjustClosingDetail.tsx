import { useAdjustClosingDetailWithQuery } from '../hooks/useAdjustClosingDetailWithQuery';
import { Resizable, ScrollArea } from 'erxes-ui';
import { ActivityLogs } from 'ui-modules';
import { AdjustClosingDetailFields } from './AdjustClosingDetailFields';

export const AdjustClosingEntryDetail = () => {
  const { adjustClosingDetail } = useAdjustClosingDetailWithQuery();

  return (
    <Resizable.PanelGroup
      direction="horizontal"
      className="flex-auto min-h-full overflow-hidden"
    >
      <Resizable.Panel>
        <ScrollArea className="h-full">
          <AdjustClosingDetailFields />
          {adjustClosingDetail && (
            <ActivityLogs targetId={adjustClosingDetail?._id} />
          )}
        </ScrollArea>
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
