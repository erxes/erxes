import { IconArchive } from '@tabler/icons-react';
import { Label, RecordTable } from 'erxes-ui';
import { AutomationBotSheetForm } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationBotSheetForm';
import { automationFacebookBotsColumns } from '~/widgets/automations/modules/facebook/components/bots/components/automationFacebookBotsColumns';
import { useAutomationBotsRecordTable } from '~/widgets/automations/modules/facebook/components/bots/hooks/useAutomationBotsRecordTable';

export const AutomationBotsRecordTable = () => {
  const { facebookMessengerBots, loading } = useAutomationBotsRecordTable();

  return (
    <>
      <AutomationBotSheetForm />
      <RecordTable.Provider
        columns={automationFacebookBotsColumns}
        data={facebookMessengerBots || []}
        className="h-full"
      >
        <RecordTable.Scroll>
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={10} />}
              <RecordTable.RowList />
              {!loading && facebookMessengerBots.length === 0 && (
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
