import { AccountingCheckSyncedDealRulePicker } from './AccountingCheckSyncedDealRuleSelect';
import { CheckSyncedCommandBar } from '~/modules/check-synced/components/CheckSyncedCommandBar';
import type { AccountingCheckSyncedDealRuleScope } from './AccountingCheckSyncedDealRuleSelect';
import type { ReactNode } from 'react';

type AccountingCheckSyncedDealsCommandBarProps = Omit<
  Parameters<typeof CheckSyncedCommandBar>[0],
  'checkLabel' | 'RulePicker'
> & {
  ruleScope?: AccountingCheckSyncedDealRuleScope;
};

export const AccountingCheckSyncedDealsCommandBar = ({
  ruleScope = 'deal',
  ...props
}: AccountingCheckSyncedDealsCommandBarProps) => {
  const RulePicker = ({ children }: { children: ReactNode }) => (
    <AccountingCheckSyncedDealRulePicker ruleScope={ruleScope}>
      {children}
    </AccountingCheckSyncedDealRulePicker>
  );

  return (
    <CheckSyncedCommandBar
      {...props}
      checkLabel="check-deals"
      RulePicker={RulePicker}
    />
  );
};
