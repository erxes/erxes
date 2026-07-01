import { CheckSyncedCommandBar } from '../../components/CheckSyncedCommandBar';
import { AccountingCheckSyncedOrderRulePicker } from './AccountingCheckSyncedOrderRuleSelect';

/** ene order-d zoriulsan commandbar. */
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
