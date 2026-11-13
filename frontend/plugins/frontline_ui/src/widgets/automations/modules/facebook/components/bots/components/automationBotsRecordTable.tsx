import { AutomationBotsEmptyState } from '~/widgets/automations/components/AutomationBotsEmptyState';
import { AutomationBotsPage } from '~/widgets/automations/components/AutomationBotsPage';
import { type AutomationRemoteEntryTypes } from 'ui-modules';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationBotSheetForm } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationBotSheetForm';
import { automationFacebookBotsColumns } from '~/widgets/automations/modules/facebook/components/bots/components/automationFacebookBotsColumns';
import { useAutomationBotsRecordTable } from '~/widgets/automations/modules/facebook/components/bots/hooks/useAutomationBotsRecordTable';

export const AutomationBotsRecordTable = ({
  renderHeader,
  listHeader,
}: Readonly<AutomationRemoteEntryTypes['automationBotsContent']>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const { facebookMessengerBots, loading } = useAutomationBotsRecordTable();

  return (
    <AutomationBotsPage
      actions={<AutomationBotSheetForm />}
      renderHeader={renderHeader}
      listHeader={listHeader}
    >
      {!loading && facebookMessengerBots.length === 0 ? (
        <AutomationBotsEmptyState platform="facebook" />
      ) : (
        <RecordTable.Provider
          columns={automationFacebookBotsColumns(t)}
          data={facebookMessengerBots || []}
          className="min-h-0 flex-1"
          tableId="frontline_facebook_automation_bots_record_table"
        >
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header showColumnSelector />
              <RecordTable.Body>
                {loading && <RecordTable.RowSkeleton rows={10} />}
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTable.Provider>
      )}
    </AutomationBotsPage>
  );
};
