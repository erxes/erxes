import { IconArchive } from '@tabler/icons-react';
import { Label, RecordTable } from 'erxes-ui';
import { AutomationBotSheetForm } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationBotSheetForm';
import { automationInstagramBotsColumns } from '~/widgets/automations/modules/instagram/components/bots/components/automationInstagramBotsColumns';
import { useAutomationBotsRecordTable } from '~/widgets/automations/modules/instagram/components/bots/hooks/useAutomationBotsRecordTable';

export const AutomationBotsRecordTable = () => {
  const { instagramMessengerBots, loading } = useAutomationBotsRecordTable();

  return (
    <>
      <AutomationBotSheetForm />
      <RecordTable.Provider
        columns={automationInstagramBotsColumns}
        data={instagramMessengerBots || []}
        className="h-full"
      >
        <RecordTable.Scroll>
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={10} />}
              <RecordTable.RowList />
              {!loading && instagramMessengerBots.length === 0 && (
                <tr className="h-[80vh]">
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <IconArchive className="w-8 h-8 mb-2" />
                      <Label>No results</Label>
                    </div>
                  </td>
                </tr>
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </>
  );
};
