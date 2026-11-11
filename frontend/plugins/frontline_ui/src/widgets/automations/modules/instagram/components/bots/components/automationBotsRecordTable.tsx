import { AutomationBotsEmptyState } from '~/widgets/automations/components/AutomationBotsEmptyState';
import { AutomationBotsPage } from '~/widgets/automations/components/AutomationBotsPage';
import { type AutomationRemoteEntryTypes } from 'ui-modules';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationBotSheetForm } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationBotSheetForm';
import { automationInstagramBotsColumns } from '~/widgets/automations/modules/instagram/components/bots/components/automationInstagramBotsColumns';
import { useAutomationBotsRecordTable } from '~/widgets/automations/modules/instagram/components/bots/hooks/useAutomationBotsRecordTable';

export const AutomationBotsRecordTable = ({
  renderHeader,
  listHeader,
}: Readonly<AutomationRemoteEntryTypes['automationBotsContent']>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  const { instagramMessengerBots, loading } = useAutomationBotsRecordTable();

  return (
    <AutomationBotsPage
      actions={<AutomationBotSheetForm />}
      renderHeader={renderHeader}
      listHeader={listHeader}
    >
      {!loading && instagramMessengerBots.length === 0 ? (
        <AutomationBotsEmptyState platform="instagram" />
      ) : (
        <RecordTable.Provider
          columns={automationInstagramBotsColumns(t)}
          data={instagramMessengerBots || []}
          className="min-h-0 flex-1"
        >
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
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
