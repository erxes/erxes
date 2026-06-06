import { AutomationActionFormProps } from 'ui-modules';
import { AdjustScoreCampaignActionConfigForm } from './adjust-score/AdjustScoreCampaignActionConfigForm';
import { IssueVoucherActionConfigForm } from './voucher/IssueVoucherActionConfigForm';
import { AwardSpinActionConfigForm } from './spin/AwardSpinActionConfigForm';
import {
  isAdjustScoreActionType,
  isAwardSpinActionType,
  isIssueVoucherActionType,
} from '../../utils/loyaltyActionUtils';

export const LoyaltyActionConfigForm = (props: AutomationActionFormProps) => {
  if (isAdjustScoreActionType(props.currentAction?.type || props.type)) {
    return <AdjustScoreCampaignActionConfigForm {...props} />;
  }

  if (isIssueVoucherActionType(props.currentAction?.type || props.type)) {
    return <IssueVoucherActionConfigForm {...props} />;
  }

  if (isAwardSpinActionType(props.currentAction?.type || props.type)) {
    return <AwardSpinActionConfigForm {...props} />;
  }

  return null;
};
