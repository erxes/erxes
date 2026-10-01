import { AutomationExecutionActionResultProps } from 'ui-modules';
import {
  isIssueVoucherActionType,
  isSetTierActionType,
} from '../../utils/loyaltyActionUtils';
import { ScoreActionResult } from './adjust-score/ScoreActionResult';
import { SetTierActionResult } from './set-tier/SetTierActionResult';
import { IssueVoucherActionResult } from './voucher/IssueVoucherActionResult';

export const LoyaltyActionResult = (
  props: AutomationExecutionActionResultProps,
) => {
  if (isSetTierActionType(props.action.actionType)) {
    return <SetTierActionResult {...props} />;
  }

  if (isIssueVoucherActionType(props.action.actionType)) {
    return <IssueVoucherActionResult {...props} />;
  }

  return <ScoreActionResult {...props} />;
};
