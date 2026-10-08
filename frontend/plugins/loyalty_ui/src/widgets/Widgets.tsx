import { IRelationWidgetProps } from 'ui-modules';
import { ScoreSummaryWidget } from '../modules/loyalties/scores/components/ScoreSummaryWidget';
import { RecordLoyaltyWidget } from '../modules/loyalties/scores/components/RecordLoyaltyWidget';

const CONTENT_TYPE_TO_OWNER_TYPE: Record<string, string> = {
  'core:customer': 'customer',
  'core:company': 'company',
  'core:user': 'user',
};

export const Widgets = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const ownerType = CONTENT_TYPE_TO_OWNER_TYPE[contentType];

  // A record that is not an owner (a deal, an order): the points it moved,
  // and its customers' loyalty in their own tabs.
  if (!ownerType) {
    return (
      <RecordLoyaltyWidget
        contentType={contentType}
        contentId={contentId}
        customerId={customerId}
      />
    );
  }

  return <ScoreSummaryWidget ownerId={contentId} ownerType={ownerType} />;
};

export default Widgets;
