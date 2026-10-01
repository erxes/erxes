import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { LoyaltyActionConfigForm } from './action/LoyaltyActionConfigForm';
import { LoyaltyActionNodeContent } from './action/LoyaltyActionNodeContent';
import { LoyaltyActionResult } from './action/LoyaltyActionResult';
import { TierChangedHistoryName } from './trigger/TierChangedHistoryName';
import { TierChangedTriggerConfigForm } from './trigger/TierChangedTriggerConfigForm';
import { TierChangedTriggerNodeContent } from './trigger/TierChangedTriggerNodeContent';

export const LoyaltyRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        triggerForm: TierChangedTriggerConfigForm,
        triggerConfigContent: TierChangedTriggerNodeContent,
        actionNodeConfiguration: LoyaltyActionNodeContent,
        historyActionResult: LoyaltyActionResult,
        historyName: TierChangedHistoryName,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <LoyaltyActionConfigForm {...props} />;
}
