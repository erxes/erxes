import { Sheet } from 'erxes-ui';
import { AddLoyaltyScoreForm } from '../add-score-campaign/components/AddLoyaltyScore';
import { LoyaltyScoreAddSheetHeader } from './LoyaltyScoreAddSheet';

// The campaign form opened from elsewhere; what it creates is handed back.
export const LoyaltyScoreCreateSheet = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaignId: string) => void;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange} modal>
    <Sheet.View
      className="p-0 md:max-w-7xl md:w-[calc(100vw-(--spacing(4)))] flex flex-col gap-0 overflow-hidden"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
    >
      <LoyaltyScoreAddSheetHeader />
      <AddLoyaltyScoreForm onOpenChange={onOpenChange} onCreated={onCreated} />
    </Sheet.View>
  </Sheet>
);
