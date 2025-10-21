import { RecordTable } from 'erxes-ui';
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
        <RecordTable className="w-full">
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={10} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Provider>
    </>
  );
};
