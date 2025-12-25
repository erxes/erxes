import { IPricingPlanDetail } from '@/pricing/types';
import { InfoCard } from 'erxes-ui';
import { Location } from '@/pricing/edit-pricing/components/options/Location';
import { Stage } from '@/pricing/edit-pricing/components/options/Stage';

interface OptionsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const OptionsInfo = ({ pricingId, pricingDetail }: OptionsInfoProps) => {
  return (
    <div className="p-6 space-y-6">
      <InfoCard title="Location">
        <InfoCard.Content>
          <Location pricingId={pricingId} pricingDetail={pricingDetail} />
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title="Stage">
        <InfoCard.Content>
          <Stage pricingId={pricingId} pricingDetail={pricingDetail} />
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
