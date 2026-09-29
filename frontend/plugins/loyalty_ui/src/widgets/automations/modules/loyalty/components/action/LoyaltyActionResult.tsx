import { AutomationExecutionActionResultProps } from 'ui-modules';
import { isSetTierActionType } from '../../utils/loyaltyActionUtils';
import { ScoreActionResult } from './adjust-score/ScoreActionResult';
import { SetTierActionResult } from './set-tier/SetTierActionResult';

export const LoyaltyActionResult = (
  props: AutomationExecutionActionResultProps,
) =>
  isSetTierActionType(props.action.actionType) ? (
    <SetTierActionResult {...props} />
  ) : (
    <ScoreActionResult {...props} />
  );
