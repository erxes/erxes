import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { LoyaltyActionConfigForm } from './action/LoyaltyActionConfigForm';
import { LoyaltyActionNodeContent } from './action/LoyaltyActionNodeContent';
import { LoyaltyActionResult } from './action/LoyaltyActionResult';

export const LoyaltyRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        actionNodeConfiguration: LoyaltyActionNodeContent,
        historyActionResult: LoyaltyActionResult,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <LoyaltyActionConfigForm {...props} />;
}
