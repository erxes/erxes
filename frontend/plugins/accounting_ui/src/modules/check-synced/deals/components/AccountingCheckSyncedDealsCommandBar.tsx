import { CheckSyncedCommandBar } from '../../components/CheckSyncedCommandBar';
import { AccountingCheckSyncedDealRulePicker } from './AccountingCheckSyncedDealRuleSelect';

/** ene deal-d zoriulsan commandbar. */
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
