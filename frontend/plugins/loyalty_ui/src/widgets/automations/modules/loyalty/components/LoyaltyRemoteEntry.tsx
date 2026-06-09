import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { LoyaltyActionConfigForm } from './action/LoyaltyActionConfigForm';
import { LoyaltyActionNodeContent } from './action/LoyaltyActionNodeContent';

export const LoyaltyRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        actionNodeConfiguration: LoyaltyActionNodeContent,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <LoyaltyActionConfigForm {...props} />;
}
