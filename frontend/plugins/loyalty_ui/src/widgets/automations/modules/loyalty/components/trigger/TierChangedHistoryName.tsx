import { AutomationExecutionHistoryNameProps } from 'ui-modules';
import { LoyaltyOwnerInline } from '../common/LoyaltyOwnerInline';

// A tier-changed run is named by whose tier moved.
export const TierChangedHistoryName = ({
  target,
}: AutomationExecutionHistoryNameProps<{ _id?: string; ownerType?: string }>) =>
  target?._id ? (
    <LoyaltyOwnerInline ownerId={target._id} ownerType={target.ownerType} />
  ) : null;
