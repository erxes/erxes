import { CheckSyncedCommandBar } from '../../components/CheckSyncedCommandBar';
import { AccountingCheckSyncedOrderRulePicker } from './AccountingCheckSyncedOrderRuleSelect';

export const AccountingCheckSyncedOrdersCommandBar = (
  props: Omit<
    Parameters<typeof CheckSyncedCommandBar>[0],
    'checkLabel' | 'RulePicker'
  >,
) => (
  <CheckSyncedCommandBar
    {...props}
    checkLabel="check-orders"
    RulePicker={AccountingCheckSyncedOrderRulePicker}
  />
);
