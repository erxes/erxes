import { CheckSyncedCommandBar } from '../../components/CheckSyncedCommandBar';
import { AccountingCheckSyncedDealRulePicker } from './AccountingCheckSyncedDealRuleSelect';

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
