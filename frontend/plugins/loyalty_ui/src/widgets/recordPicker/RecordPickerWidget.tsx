import { IRecordPickerWidgetProps } from 'ui-modules';
import { ScoreCampaignPicker } from './components/ScoreCampaignPicker';

export const SCORE_CAMPAIGN_PICKER = 'scoreCampaign';

// Loyalty's records offered to other plugins' forms.
export const RecordPickerWidget = (props: IRecordPickerWidgetProps) =>
  props.module === SCORE_CAMPAIGN_PICKER ? (
    <ScoreCampaignPicker {...props} />
  ) : null;
