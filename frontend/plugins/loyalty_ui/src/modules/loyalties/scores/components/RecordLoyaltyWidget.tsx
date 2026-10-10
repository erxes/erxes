import { Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomersInline } from 'ui-modules';
import {
  RECORD_TAB,
  useRecordLoyaltyTabs,
} from '../hooks/useRecordLoyaltyTabs';
import { ScoreSummaryWidget } from './ScoreSummaryWidget';
import { ScoreTargetHistoryWidget } from './ScoreTargetHistoryWidget';

const PANEL_CLASS =
  'flex-auto flex-col overflow-hidden data-[state=active]:flex data-[state=inactive]:hidden';

// A deal or an order: what it moved, and its customers' loyalty beside it.
export const RecordLoyaltyWidget = (props: {
  contentType: string;
  contentId: string;
  customerId?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { tab, setTab, customerIds } = useRecordLoyaltyTabs(props);

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex h-full flex-col overflow-hidden"
    >
      <Tabs.List className="flex-none overflow-x-auto px-2">
        <Tabs.Trigger value={RECORD_TAB}>
          {t('target-score-history')}
        </Tabs.Trigger>
        {customerIds.map((id) => (
          <Tabs.Trigger key={id} value={id}>
            <CustomersInline customerIds={[id]} placeholder="—" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value={RECORD_TAB} className={PANEL_CLASS}>
        <ScoreTargetHistoryWidget targetId={props.contentId} />
      </Tabs.Content>
      {customerIds.map((id) => (
        <Tabs.Content key={id} value={id} className={PANEL_CLASS}>
          <ScoreSummaryWidget ownerId={id} ownerType="customer" />
        </Tabs.Content>
      ))}
    </Tabs>
  );
};
