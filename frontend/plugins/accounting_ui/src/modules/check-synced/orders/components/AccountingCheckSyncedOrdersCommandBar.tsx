import { AccountingCheckSyncedOrderRulePicker } from './AccountingCheckSyncedOrderRuleSelect';
import { CheckSyncedCommandBar } from '~/modules/check-synced/components/CheckSyncedCommandBar';

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
