import { IRelationWidgetProps } from 'ui-modules';
import { ScoreSummaryWidget } from '../modules/loyalties/scores/components/ScoreSummaryWidget';

const CONTENT_TYPE_TO_OWNER_TYPE: Record<string, string> = {
  'core:customer': 'customer',
  'core:company': 'company',
  'core:user': 'user',
};

export const Widgets = ({
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  const ownerType = CONTENT_TYPE_TO_OWNER_TYPE[contentType] || contentType;

  return (
    <ScoreSummaryWidget ownerId={contentId} ownerType={ownerType} />
  );
};

export default Widgets;
