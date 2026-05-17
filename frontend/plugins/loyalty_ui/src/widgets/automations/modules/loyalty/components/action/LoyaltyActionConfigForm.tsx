import { AutomationActionFormProps } from 'ui-modules';
import { AdjustScoreCampaignActionConfigForm } from './adjust-score/AdjustScoreCampaignActionConfigForm';
import { isAdjustScoreActionType } from '../../utils/loyaltyActionUtils';
import { TAdjustScoreActionConfigForm } from '../../states/adjustScoreActionConfigFormDefinitions';

export const LoyaltyActionConfigForm = (
  props: AutomationActionFormProps<TAdjustScoreActionConfigForm>,
) => {
  console.log(props.currentAction?.type, props.type);
  if (isAdjustScoreActionType(props.currentAction?.type || props.type)) {
    return <AdjustScoreCampaignActionConfigForm {...props} />;
  }

  return null;
};
