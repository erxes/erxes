import { AccountingCheckSyncedDealRulePicker } from './AccountingCheckSyncedDealRuleSelect';
import { CheckSyncedCommandBar } from '~/modules/check-synced/components/CheckSyncedCommandBar';

export const AccountingCheckSyncedDealsCommandBar = (
  props: Omit<
    Parameters<typeof CheckSyncedCommandBar>[0],
    'checkLabel' | 'RulePicker'
  >,
) => (
  <CheckSyncedCommandBar
    {...props}
    checkLabel="check-deals"
    RulePicker={AccountingCheckSyncedDealRulePicker}
  />
);
