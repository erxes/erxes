import { PageContainer, PageSubHeader } from 'erxes-ui';
import { AccountingCheckSyncedDealsFilter } from './AccountingCheckSyncedDealsFilter';
import {
  AccountingCheckSyncedDealsRecordTable,
  DEAL_MOVEMENT_RECORD_TABLE_OPTIONS,
} from './AccountingCheckSyncedDealsRecordTable';
import type { AccountingCheckSyncedDealRuleScope } from './AccountingCheckSyncedDealRuleSelect';

type AccountingCheckSyncedDealsPageProps = {
  filterId?: string;
  ruleScope?: AccountingCheckSyncedDealRuleScope;
  sessionKey?: string;
  tableId?: string;
};

export const AccountingCheckSyncedDealsPage = ({
  filterId,
  ruleScope = 'deal',
  sessionKey,
  tableId,
}: AccountingCheckSyncedDealsPageProps) => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountingCheckSyncedDealsFilter
          filterId={filterId}
          ruleScope={ruleScope}
        />
      </PageSubHeader>
      <AccountingCheckSyncedDealsRecordTable
        ruleScope={ruleScope}
        sessionKey={sessionKey}
        tableId={tableId}
      />
    </PageContainer>
  );
};

export const AccountingCheckSyncedDealMovementsPage = () => (
  <AccountingCheckSyncedDealsPage
    filterId="accounting-check-synced-deal-movements-filter"
    ruleScope="movement"
    {...DEAL_MOVEMENT_RECORD_TABLE_OPTIONS}
  />
);
